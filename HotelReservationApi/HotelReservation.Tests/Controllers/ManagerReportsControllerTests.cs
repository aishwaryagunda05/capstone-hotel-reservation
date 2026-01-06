using FluentAssertions;
using HotelReservation.Api.Controllers;
using HotelReservation.Api.Data;
using HotelReservation.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;

namespace HotelReservation.Tests.Controllers
{
    public class ManagerReportsControllerTests
    {
        private readonly AppDbContext _context;
        private readonly ManagerReportsController _controller;

        public ManagerReportsControllerTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);
            _controller = new ManagerReportsController(_context);

            SeedData();
            SetupUser();
        }

        private void SetupUser()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "1"), 
                new Claim(ClaimTypes.Email, "manager@test.com")
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        private void SeedData()
        {
            var manager = new User { UserId = 1, FullName = "Manager", Email = "manager@test.com", Role = "Manager", PasswordHash = "hash" };
            var guest = new User { UserId = 2, FullName = "Guest", Email = "guest@test.com", Role = "Guest", PasswordHash = "hash" };
            _context.Users.AddRange(manager, guest);

            var hotel = new Hotel { HotelId = 1, HotelName = "Test Hotel", City = "Test City", Address = "Addr", Phone = "123", Email = "h@test.com" };
            _context.Hotels.Add(hotel);

            _context.UserHotelAssignments.Add(new UserHotelAssignment { UserHotelAssignmentId = 1, UserId = 1, HotelId = 1, IsActive = true });
            var room1 = new Room { RoomId = 1, HotelId = 1, RoomNumber = "101", IsActive = true };
            var room2 = new Room { RoomId = 2, HotelId = 1, RoomNumber = "102", IsActive = true };
            var room3 = new Room { RoomId = 3, HotelId = 1, RoomNumber = "103", IsActive = true };
            var room4 = new Room { RoomId = 4, HotelId = 1, RoomNumber = "104", IsActive = true };
            _context.Rooms.AddRange(room1, room2, room3, room4);

            _context.SaveChanges();
        }

        [Fact]
        public async Task GetManagerStats_ShouldReturnCorrectActiveGuests_WhenGuestIsCheckedIn()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var r1 = new Reservation 
            { 
                ReservationId = 1, 
                UserId = 2, 
                HotelId = 1, 
                GuestName = "Test Guest",
                Status = "CheckedIn",
                CheckInDate = today.AddDays(-1),
                CheckOutDate = today.AddDays(2),
                CreatedDate = DateTime.UtcNow
            };
            var rr1 = new ReservationRoom { ReservationId = 1, RoomId = 1 };
            
            _context.Reservations.Add(r1);
            _context.ReservationRooms.Add(rr1);
            _context.SaveChanges();
            var result = await _controller.GetManagerStats(1);
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            Assert.NotNull(okResult);
            var val = okResult.Value;
            Assert.NotNull(val);
            var json = System.Text.Json.JsonSerializer.Serialize(val);
            json.Should().Contain("\"ActiveGuests\":1");
            json.Should().Contain("\"OccupancyRate\":25");
        }

        [Fact]
        public async Task GetManagerStats_ShouldReturnZeroActiveGuests_WhenGuestIsCheckedOut()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var r2 = new Reservation 
            { 
                ReservationId = 2, 
                UserId = 2, 
                HotelId = 1, 
                GuestName = "Test Guest",
                Status = "CheckedOut",
                CheckInDate = today.AddDays(-5),
                CheckOutDate = today.AddDays(-1),
                CreatedDate = DateTime.UtcNow
            };
             var rr2 = new ReservationRoom { ReservationId = 2, RoomId = 2 };

            _context.Reservations.Add(r2);
            _context.ReservationRooms.Add(rr2);
            _context.SaveChanges();
            var result = await _controller.GetManagerStats(1);
            var okResult = result as OkObjectResult;
            Assert.NotNull(okResult);
            var val = okResult.Value;
            Assert.NotNull(val);
            var json = System.Text.Json.JsonSerializer.Serialize(val);

            json.Should().Contain("\"ActiveGuests\":0");
            json.Should().Contain("\"OccupancyRate\":0");
        }

        [Fact]
        public async Task GetManagerStats_ShouldCountConfirmedToday_AsActive()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var r3 = new Reservation 
            { 
                ReservationId = 3, 
                UserId = 2, 
                HotelId = 1, 
                GuestName = "Test Guest",
                Status = "Confirmed",
                CheckInDate = today,
                CheckOutDate = today.AddDays(1),
                CreatedDate = DateTime.UtcNow
            };
            var rr3 = new ReservationRoom { ReservationId = 3, RoomId = 3 };

            _context.Reservations.Add(r3);
            _context.ReservationRooms.Add(rr3);
            _context.SaveChanges();
            var result = await _controller.GetManagerStats(1);
            var okResult = result as OkObjectResult;
            Assert.NotNull(okResult);
            var val = okResult.Value;
            Assert.NotNull(val);
            var json = System.Text.Json.JsonSerializer.Serialize(val);
            json.Should().Contain("\"ActiveGuests\":1");
        }
        [Fact]
        public async Task GetManagerStats_ShouldReturnCorrectCombinedStats()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var hotel2 = new Hotel { HotelId = 2, HotelName = "Hotel 2", Address = "A2", City = "C2", Phone = "2", Email = "e2" };
            _context.Hotels.Add(hotel2);
            _context.UserHotelAssignments.Add(new UserHotelAssignment { UserId = 1, HotelId = 2, IsActive = true });

            var r4 = new Reservation 
            { 
                ReservationId = 4, 
                UserId = 2, 
                HotelId = 2, 
                GuestName = "Guest 2",
                Status = "CheckedIn",
                CheckInDate = today.AddDays(-1),
                CheckOutDate = today.AddDays(2),
                CreatedDate = DateTime.UtcNow
            };
            
            var room5 = new Room { RoomId = 5, HotelId = 2, RoomNumber = "201", IsActive = true };
            _context.Rooms.Add(room5);
            var rr4 = new ReservationRoom { ReservationId = 4, RoomId = 5 }; 
            var inv4 = new Invoice 
            { 
                InvoiceId = 4, 
                ReservationId = 4, 
                PaymentStatus = "Paid", 
                GrandTotal = 100, 
                InvoiceDate = DateTime.UtcNow 
            };

            _context.Reservations.Add(r4);
            _context.ReservationRooms.Add(rr4);
            _context.Invoices.Add(inv4);
            _context.SaveChanges();
            var result = await _controller.GetManagerStats(0);
            var okResult = result as OkObjectResult;
            Assert.NotNull(okResult);
            var val = okResult.Value;
            var json = System.Text.Json.JsonSerializer.Serialize(val);
            
            json.Should().Contain("\"TotalRevenue\":100");
            json.Should().Contain("\"ActiveGuests\":1");
            json.Should().Contain("\"OccupancyRate\":20");
        }
        [Fact]
        public async Task GetManagerReservationDistribution_ShouldReturnCorrectCounts()
        {
            
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
             var r5 = new Reservation 
            { 
                ReservationId = 5, 
                UserId = 1, 
                HotelId = 1, 
                GuestName = "Guest 5",
                Status = "CheckedIn",
                CheckInDate = today,
                CheckOutDate = today.AddDays(1),
                CreatedDate = DateTime.UtcNow
            };
             var rr5 = new ReservationRoom { ReservationId = 5, RoomId = 1 };

            _context.Reservations.Add(r5);
            _context.ReservationRooms.Add(rr5);
            _context.SaveChanges();

            var result = await _controller.GetManagerReservationDistribution(1);
            var okResult = result as OkObjectResult;
            Assert.NotNull(okResult);
            var val = okResult.Value; 
            var json = System.Text.Json.JsonSerializer.Serialize(val);
            json.Should().Contain("CheckedIn");
            json.Should().Contain(":1"); 
        }
    }
}
