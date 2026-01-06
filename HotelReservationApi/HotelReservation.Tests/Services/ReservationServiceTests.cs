using FluentAssertions;
using HotelReservation.Api.Data;
using HotelReservation.Api.DTOs;

using HotelReservation.Api.Models;
using HotelReservation.Api.Repositories;
using HotelReservation.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HotelReservation.Tests.Services
{
    public class ReservationServiceTests
    {
        private readonly AppDbContext _context;
        private readonly ReservationRepository _repo;
        private readonly ReservationService _service;

        public ReservationServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);
            _repo = new ReservationRepository(_context);
            _service = new ReservationService(_repo);

            SeedData();
        }

        private void SeedData()
        {
            _context.Hotels.Add(new Hotel { HotelId = 1, HotelName = "Test Hotel", City = "Test City", Address = "Test Address", Phone = "123", Email = "h@test.com" });
            _context.RoomTypes.Add(new RoomType { RoomTypeId = 1, RoomTypeName = "Deluxe", BasePrice = 100, MaxGuests = 2 });
            _context.Rooms.Add(new Room { RoomId = 1, HotelId = 1, RoomTypeId = 1, RoomNumber = "101", IsActive = true });
            _context.Rooms.Add(new Room { RoomId = 2, HotelId = 1, RoomTypeId = 1, RoomNumber = "102", IsActive = true });
            _context.Users.Add(new User { UserId = 1, FullName = "Guest", Email = "g@test.com", Role = "Guest", PasswordHash = "hash" });
            
            _context.SaveChanges();
        }

        [Fact]
        public async Task SearchRooms_ShouldReturnAllRooms_WhenNoReservationsExist()
        {
            var req = new RoomSearchRequestDto
            {
                HotelId = 1,
                CheckInDate = new DateOnly(2025, 1, 1),
                CheckOutDate = new DateOnly(2025, 1, 5),
                Guests = 2
            };

            var result = await _service.SearchRooms(req);

            result.Should().HaveCount(2);
        }

        [Theory]
        [InlineData("2025-01-01", "2025-01-05", "2025-01-02", "2025-01-04", 1)] 
        [InlineData("2025-01-01", "2025-01-05", "2025-01-01", "2025-01-06", 1)] 
        [InlineData("2025-01-01", "2025-01-05", "2024-12-30", "2025-01-02", 1)] 
        [InlineData("2025-01-01", "2025-01-05", "2025-01-04", "2025-01-08", 1)] 
        public async Task SearchRooms_ShouldExcludeOccupiedRooms(string resStart, string resEnd, string searchStart, string searchEnd, int expectedCount)
        {
            var rStart = DateOnly.Parse(resStart);
            var rEnd = DateOnly.Parse(resEnd);

            var reservation = new Reservation
            {
                ReservationId = 1,
                HotelId = 1,
                UserId = 1,
                CheckInDate = rStart,
                CheckOutDate = rEnd,
                Status = "Confirmed",
                GuestName = "Guest",
                GuestPhone = "1234567890",
                CreatedDate = DateTime.UtcNow
            };
            _context.Reservations.Add(reservation);
            _context.ReservationRooms.Add(new ReservationRoom { ReservationId = 1, RoomId = 1, PricePerNight = 100, TotalAmount = 100 });
            await _context.SaveChangesAsync();

            var req = new RoomSearchRequestDto
            {
                HotelId = 1,
                CheckInDate = DateOnly.Parse(searchStart),
                CheckOutDate = DateOnly.Parse(searchEnd),
                Guests = 2
            };

            var result = await _service.SearchRooms(req);
            result.Should().HaveCount(expectedCount);
            if (expectedCount > 0)
            {
                result.First().RoomNumber.Should().Be("102");
            }
        }

        [Fact]
        public async Task CreateReservation_ShouldSucceed_WhenRoomIsAvailable()
        {
            var dto = new CreateReservationDto
            {
                HotelId = 1,
                CheckInDate = new DateOnly(2025, 2, 1),
                CheckOutDate = new DateOnly(2025, 2, 5),
                RoomIds = new List<int> { 1 }
            };

            var id = await _service.CreateReservation(1, dto);

            id.Should().BeGreaterThan(0);
            _context.Reservations.Should().ContainSingle(r => r.ReservationId == id);
        }

        [Fact]
        public async Task ConfirmReservation_ShouldUpdateStatus_WhenBooked()
        {
            var res = new Reservation { ReservationId = 10, Status = "Booked", GuestName = "G", HotelId = 1, UserId = 1 };
            _context.Reservations.Add(res);
            await _context.SaveChangesAsync();
            var result = await _service.ConfirmReservation(10);
            result.Should().BeTrue();
            var updated = await _context.Reservations.FindAsync(10);
            Assert.NotNull(updated);
            updated.Status.Should().Be("Confirmed");
        }

        [Fact]
        public async Task CheckInReservation_ShouldUpdateStatus_WhenConfirmed()
        {
            var res = new Reservation { ReservationId = 11, Status = "Confirmed", GuestName = "G", HotelId = 1, UserId = 1 };
            _context.Reservations.Add(res);
            await _context.SaveChangesAsync();
            var result = await _service.CheckInReservation(11);
            result.Should().BeTrue();
            var updated = await _context.Reservations.FindAsync(11);
            Assert.NotNull(updated);
            updated.Status.Should().Be("CheckedIn");
        }

        [Fact]
        public async Task CheckOutReservation_ShouldUpdateStatusAndFee_WhenCheckedIn()
        {
            var res = new Reservation { ReservationId = 12, Status = "CheckedIn", GuestName = "G", HotelId = 1, UserId = 1 };
            _context.Reservations.Add(res);
            await _context.SaveChangesAsync();
            var result = await _service.CheckOutReservation(12, 50.0m);
            result.Should().BeTrue();
            var updated = await _context.Reservations.FindAsync(12);
            Assert.NotNull(updated);
            updated.Status.Should().Be("CheckedOut");
            updated.BreakageFee.Should().Be(50.0m);
        }

        [Fact]
        public async Task CancelReservation_ShouldUpdateStatus_WhenOwnedByUser()
        {
            var res = new Reservation { ReservationId = 13, Status = "Booked", UserId = 1, GuestName = "G", HotelId = 1 };
            _context.Reservations.Add(res);
            await _context.SaveChangesAsync();
            var result = await _service.CancelReservation(13, 1);
            result.Should().BeTrue();
            var updated = await _context.Reservations.FindAsync(13);
            Assert.NotNull(updated);
            updated.Status.Should().Be("Cancelled");
        }
    }
}
