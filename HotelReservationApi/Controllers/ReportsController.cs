using HotelReservation.Api.Data;
using HotelReservation.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HotelReservation.Api.Controllers
{
    [ApiController]
    [Route("api/admin/reports")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalHotels = await _context.Hotels.CountAsync();
            var totalUsers = await _context.Users.CountAsync(u => u.Role == "Guest");
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var activeGuests = await _context.Reservations
                .CountAsync(r => r.CheckInDate <= today && r.CheckOutDate > today && r.Status != "Cancelled");

            var totalRevenue = await _context.Invoices
                .Where(i => i.PaymentStatus == "Paid")
                .SumAsync(i => i.GrandTotal);

            var totalRoomsList = await _context.Rooms.CountAsync();
            double occupancyRate = totalRoomsList > 0 ? (double)activeGuests / totalRoomsList * 100 : 0;

            return Ok(new
            {
                TotalHotels = totalHotels,
                TotalUsers = totalUsers,
                ActiveGuests = activeGuests,
                TotalRevenue = totalRevenue,
                OccupancyRate = Math.Round(occupancyRate, 2)
            });
        }

        [HttpGet("revenue-trend")]
        public async Task<IActionResult> GetRevenueTrend()
        {
            var today = DateTime.UtcNow.Date;
            var sixMonthsAgo = today.AddMonths(-5);
            var startOfPeriod = new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1);
            
            var rawData = await _context.Invoices
                .Where(i => i.InvoiceDate >= startOfPeriod && i.PaymentStatus == "Paid")
                .Select(i => new { i.InvoiceDate, i.GrandTotal })
                .ToListAsync();

            var result = new List<object>();
            var currentMonth = startOfPeriod;
            
            for (int i = 0; i < 6; i++)
            {
                var monthStart = currentMonth;
                var monthEnd = currentMonth.AddMonths(1);
                var monthlyRevenue = rawData
                    .Where(r => r.InvoiceDate >= monthStart && r.InvoiceDate < monthEnd)
                    .Sum(r => r.GrandTotal);

                result.Add(new { Month = monthStart.ToString("MMM yyyy"), Revenue = monthlyRevenue });
                currentMonth = currentMonth.AddMonths(1);
            }

            return Ok(result);
        }

        [HttpGet("occupancy")]
        public async Task<IActionResult> GetOccupancyReport()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var hotels = await _context.Hotels.ToListAsync();
            var result = new List<object>();

            foreach (var h in hotels)
            {
                var totalRooms = await _context.Rooms.CountAsync(r => r.HotelId == h.HotelId);
                var occupiedRooms = await _context.Reservations
                    .CountAsync(r => r.HotelId == h.HotelId && r.CheckInDate <= today && r.CheckOutDate > today && r.Status == "CheckedIn");

                result.Add(new
                {
                    HotelName = h.HotelName,
                    TotalRooms = totalRooms,
                    OccupiedRooms = occupiedRooms,
                    OccupancyRate = totalRooms > 0 ? (double)occupiedRooms / totalRooms * 100 : 0
                });
            }

            return Ok(result);
        }

        [HttpGet("reservation-summary")]
        public async Task<IActionResult> GetReservationSummaryByDate()
        {
            var last30Days = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
            var summary = await _context.Reservations
                .Where(r => r.CreatedDate >= last30Days.ToDateTime(TimeOnly.MinValue))
                .GroupBy(r => DateOnly.FromDateTime(r.CreatedDate))
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return Ok(summary);
        }
    }
}
