using FluentAssertions;
using HotelReservation.Api.Controllers;
using HotelReservation.Api.Data;
using HotelReservation.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HotelReservation.Tests.Controllers
{
    public class ReportsControllerTests
    {
        private readonly AppDbContext _context;
        private readonly ReportsController _controller;

        public ReportsControllerTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);
            _controller = new ReportsController(_context);

            SeedData();
        }

        private void SeedData()
        {
            _context.Hotels.Add(new Hotel { HotelId = 1, HotelName = "H1", City = "C1", Address = "A1", Phone = "1", Email = "e1" });
            _context.Users.Add(new User { UserId = 1, FullName = "U1", Email = "u1", Role = "Guest", PasswordHash = "p" });
            _context.Rooms.Add(new Room { RoomId = 1, HotelId = 1, RoomNumber = "101", IsActive = true });
            _context.Rooms.Add(new Room { RoomId = 2, HotelId = 1, RoomNumber = "102", IsActive = true });
            _context.Invoices.Add(new Invoice { InvoiceId = 1, GrandTotal = 100, PaymentStatus = "Pending", ReservationId = 1 });
            _context.Invoices.Add(new Invoice { InvoiceId = 2, GrandTotal = 200, PaymentStatus = "Paid", ReservationId = 2 });

            _context.SaveChanges();
        }

        [Fact]
        public async Task GetDashboardStats_ShouldReturnCorrectCounts()
        {
            var result = await _controller.GetDashboardStats();
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            Assert.NotNull(okResult);
            var val = okResult.Value;
            Assert.NotNull(val);
            var json = System.Text.Json.JsonSerializer.Serialize(val);
            json.Should().Contain("\"TotalRevenue\":200");
            json.Should().Contain("\"TotalHotels\":1");
        }
    }
}
