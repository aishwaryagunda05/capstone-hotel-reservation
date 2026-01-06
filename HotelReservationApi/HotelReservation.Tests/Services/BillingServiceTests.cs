using FluentAssertions;
using HotelReservation.Api.Controllers; 
using HotelReservation.Api.Data;
using HotelReservation.Api.Models;
using HotelReservation.Api.Repositories;
using HotelReservation.Api.Services;
using HotelReservation.Api.DTOs; 
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace HotelReservation.Tests.Services
{
    public class BillingServiceTests
    {
        private readonly AppDbContext _context;
        private readonly Mock<IInvoiceRepository> _mockInvoiceRepo;
        private readonly Mock<IServiceRequestRepository> _mockServiceRequestRepo;
        private readonly ReservationRepository _reservationRepo;
        private readonly ServiceRequestService _serviceRequestService;
        private readonly BillingService _service;

        public BillingServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);
            _context.Hotels.Add(new Hotel { HotelId = 1, HotelName = "H1", City = "C1", Address = "A1", Phone = "1", Email = "e1" });
            _context.Users.Add(new User { UserId = 1, FullName = "U1", Email = "u1", Role = "Guest", PasswordHash = "p" });
            _context.SaveChanges();

            _reservationRepo = new ReservationRepository(_context);
            _mockInvoiceRepo = new Mock<IInvoiceRepository>();
            _mockServiceRequestRepo = new Mock<IServiceRequestRepository>();
            _serviceRequestService = new ServiceRequestService(_mockServiceRequestRepo.Object, _reservationRepo);
            _service = new BillingService(_mockInvoiceRepo.Object, _reservationRepo, _serviceRequestService);
        }

        [Fact]
        public async Task GetInvoicePreview_ShouldCalculateCorrectTotal()
        {
            var checkIn = new DateOnly(2025, 1, 1);
            var checkOut = new DateOnly(2025, 1, 5); 
            var reservation = new Reservation
            {
                ReservationId = 1,
                UserId = 1,
                HotelId = 1,
                GuestName = "Guest",
                GuestPhone = "123",
                CheckInDate = checkIn,
                CheckOutDate = checkOut,
                Status = "CheckedIn",
                CreatedDate = DateTime.UtcNow
            };
            _context.Reservations.Add(reservation);
            _context.ReservationRooms.Add(new ReservationRoom 
            { 
                ReservationId = 1, 
                RoomId = 1, 
                PricePerNight = 100, 
                TotalAmount = 400,
                Room = new Room { RoomId = 1, RoomNumber = "101", RoomType = new RoomType { RoomTypeName = "Deluxe" } } // Needed for preview
            });
            await _context.SaveChangesAsync();
            _mockServiceRequestRepo.Setup(x => x.GetServedByReservationId(1))
                .ReturnsAsync(new List<ServiceRequest>
                {
                    new ServiceRequest { RequestId = 1, ReservationId = 1, RequestType = "Food", Price = 50, Status = "Served" }
                });
            _mockInvoiceRepo.Setup(x => x.GetByReservationId(1))
                .ReturnsAsync((Invoice?)null);
            var preview = await _service.GetInvoicePreview(1);
            preview.Should().NotBeNull();
            Assert.NotNull(preview);
            preview.RoomTotal.Should().Be(400); 
            preview.ServiceCharges.Should().Be(50);
            
            var subTotal = 400 + 50; 
            preview.SubTotal.Should().Be(subTotal);
            
            var tax = subTotal * 0.05m;
            preview.TaxAmount.Should().Be(tax);
            preview.GrandTotal.Should().Be(subTotal + tax); 
        }

        [Theory]
        [InlineData(105, "Paid")] 
        [InlineData(50, "Pending")]
        public async Task ProcessPayment_ShouldUpdateInvoiceAndReservationStatus(decimal amount, string expectedStatus)
        {
            var reservation = new Reservation
            {
                ReservationId = 2,
                UserId = 1,
                HotelId = 1,
                GuestName = "Guest",
                GuestPhone = "123",
                CheckInDate = new DateOnly(2025, 1, 1),
                CheckOutDate = new DateOnly(2025, 1, 2), 
                Status = "CheckedOut",
                CreatedDate = DateTime.UtcNow,
                ReservationRooms = new List<ReservationRoom> { new ReservationRoom { PricePerNight = 100, TotalAmount = 100 } }
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            var req = new PaymentRequestDto
            {
                ReservationId = 2,
                Amount = amount,
                PaymentMode = "Cash"
            };
            _mockServiceRequestRepo.Setup(x => x.GetServedByReservationId(2))
                .ReturnsAsync(new List<ServiceRequest>());
            _mockInvoiceRepo.Setup(x => x.GetByReservationId(2))
                 .ReturnsAsync((Invoice?)null);
            var result = await _service.ProcessPayment(req);
            if (expectedStatus == "Paid")
            {
                 _mockInvoiceRepo.Verify(x => x.AddPayment(It.IsAny<Payment>()), Times.Once);
                 _mockInvoiceRepo.Verify(x => x.AddInvoice(It.Is<Invoice>(i => i.PaymentStatus == "Paid")), Times.Once);
            }
            else
            {
                 _mockInvoiceRepo.Verify(x => x.AddInvoice(It.Is<Invoice>(i => i.PaymentStatus == "Pending")), Times.Once);
            }
        }
    }
}
