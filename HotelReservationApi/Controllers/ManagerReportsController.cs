using HotelReservation.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HotelReservation.Api.Controllers
{
    [ApiController]
    [Route("api/manager/reports")]
    [Authorize(Roles = "Manager,Receptionist")]
    public class ManagerReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ManagerReportsController(AppDbContext context)
        {
            _context = context;
        }


        private string? GetUserEmail()
        {
            return User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.Identity?.Name;
        }

        private async Task<bool> IsManagerAssignedToHotel(string email, int hotelId)
        {
            return await _context.UserHotelAssignments
                .Include(x => x.User)
                .AnyAsync(x => x.User.Email == email && x.HotelId == hotelId && x.IsActive);
        }

        [HttpGet("{hotelId}/stats")]
        public async Task<IActionResult> GetManagerStats(int hotelId)
        {
            var email = GetUserEmail();
            if (string.IsNullOrEmpty(email)) return Unauthorized();

            List<int> targetHotelIds = new List<int>();

            if (hotelId == 0)
            {
            
                targetHotelIds = await _context.UserHotelAssignments
                    .Include(x => x.User)
                    .Where(x => x.User.Email == email && x.IsActive)
                    .Select(x => x.HotelId)
                    .ToListAsync();

                if (!targetHotelIds.Any())
                    return Ok(new { TotalRooms = 0, TotalGuests = 0, ActiveGuests = 0, TotalRevenue = 0, OccupancyRate = 0, TopHotel = "N/A" });
            }
            else
            {
                if (!await IsManagerAssignedToHotel(email, hotelId))
                    return Forbid();
                targetHotelIds.Add(hotelId);
            }

            var totalRooms = await _context.Rooms.CountAsync(r => targetHotelIds.Contains(r.HotelId));
            
            var today = DateOnly.FromDateTime(DateTime.Now);
            var allRes = await _context.Reservations
                .Include(r => r.ReservationRooms)
                .Where(r => targetHotelIds.Contains(r.HotelId))
                .ToListAsync();

            var activeRes = allRes.Where(r => {
                if (string.IsNullOrWhiteSpace(r.Status)) return false;
                var s = r.Status.ToLower().Trim();
                if (s == "checkedin") return true;
                if (s == "cancelled" || s == "checkedout" || s == "rejected") return false;
                return r.CheckInDate <= today && r.CheckOutDate >= today;
            }).ToList();

            var occupiedRoomsCount = activeRes.Sum(r => r.ReservationRooms.Count);
            var totalGuestsDistinct = allRes.Where(r => r.Status?.ToLower().Trim() != "cancelled").Select(r => r.UserId).Distinct().Count();
            var totalRevenue = await _context.Invoices
                .Include(i => i.Reservation)
                .Where(i => i.PaymentStatus == "Paid" && i.Reservation != null && targetHotelIds.Contains(i.Reservation.HotelId))
                .SumAsync(i => (decimal?)i.GrandTotal) ?? 0;

            double occupancyRate = 0;
            if (totalRooms > 0)
            {
                occupancyRate = (double)occupiedRoomsCount / totalRooms * 100;
            }
            string topHotelName = "N/A";
            if (hotelId == 0)
            {
                var revenueByHotel = await _context.Invoices
                    .Include(i => i.Reservation)
                    .ThenInclude(r => r.Hotel)
                    .Where(i => i.PaymentStatus == "Paid" && i.Reservation != null && targetHotelIds.Contains(i.Reservation.HotelId))
                    .GroupBy(i => i.Reservation.Hotel.HotelName)
                    .Select(g => new { HotelName = g.Key, Revenue = g.Sum(i => i.GrandTotal) })
                    .OrderByDescending(x => x.Revenue)
                    .FirstOrDefaultAsync();

                if (revenueByHotel != null) topHotelName = revenueByHotel.HotelName;
            }

            return Ok(new
            {
                TotalRooms = totalRooms,
                TotalGuests = totalGuestsDistinct,
                ActiveGuests = occupiedRoomsCount,
                TotalRevenue = totalRevenue,
                OccupancyRate = Math.Round(occupancyRate, 2),
                TopHotel = topHotelName,
                IsAggregate = hotelId == 0
            });
        }

        [HttpGet("{hotelId}/revenue-trend")]
        public async Task<IActionResult> GetManagerRevenueTrend(int hotelId)
        {
            var email = GetUserEmail();
            if (string.IsNullOrEmpty(email)) return Unauthorized();

            List<int> targetHotelIds = new List<int>();

            if (hotelId == 0)
            {
                targetHotelIds = await _context.UserHotelAssignments
                    .Include(x => x.User)
                    .Where(x => x.User.Email == email && x.IsActive)
                    .Select(x => x.HotelId)
                    .ToListAsync();
            }
            else
            {
                if (!await IsManagerAssignedToHotel(email, hotelId))
                    return Forbid();
                targetHotelIds.Add(hotelId);
            }

            var today = DateTime.Now.Date;
            var sixMonthsAgo = today.AddMonths(-5);
            var startOfPeriod = new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1);
            
            var rawData = await _context.Invoices
                .Include(i => i.Reservation)
                .Where(i => i.PaymentStatus == "Paid" && i.Reservation != null && 
                            targetHotelIds.Contains(i.Reservation.HotelId) && 
                            i.InvoiceDate >= startOfPeriod)
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

                result.Add(new
                {
                    Month = monthStart.ToString("MMM yyyy"),
                    Revenue = monthlyRevenue
                });

                currentMonth = currentMonth.AddMonths(1);
            }

            return Ok(result);
        }

        [HttpGet("{hotelId}/reservation-distribution")]
        public async Task<IActionResult> GetManagerReservationDistribution(int hotelId)
        {
            var email = GetUserEmail();
            if (string.IsNullOrEmpty(email)) return Unauthorized();

            List<int> targetHotelIds = new List<int>();

            if (hotelId == 0)
            {
                targetHotelIds = await _context.UserHotelAssignments
                    .Include(x => x.User)
                    .Where(x => x.User.Email == email && x.IsActive)
                    .Select(x => x.HotelId)
                    .ToListAsync();
            }
            else
            {
                if (!await IsManagerAssignedToHotel(email, hotelId))
                    return Forbid();
                targetHotelIds.Add(hotelId);
            }

            var distribution = await _context.Reservations
                .Where(r => targetHotelIds.Contains(r.HotelId))
                .GroupBy(r => r.Status)
                .Select(g => new 
                { 
                    Status = g.Key ?? "Unknown", 
                    Count = g.Count() 
                })
                .ToListAsync();

            return Ok(distribution);
        }
        [HttpGet("{hotelId}/reservations")]
        public async Task<IActionResult> GetManagerReservations(int hotelId)
        {
            try
            {
                var email = GetUserEmail();
                if (string.IsNullOrEmpty(email)) return Unauthorized();

                List<int> targetHotelIds = new List<int>();

                if (hotelId == 0)
                {
                    targetHotelIds = await _context.UserHotelAssignments
                        .Include(x => x.User)
                        .Where(x => x.User.Email == email && x.IsActive)
                        .Select(x => x.HotelId)
                        .ToListAsync();
                }
                else
                {
                    if (!await IsManagerAssignedToHotel(email, hotelId))
                        return Forbid();
                    targetHotelIds.Add(hotelId);
                }

                // Join with Invoices to get Total Price
                var reservations = await _context.Reservations
                    .Include(r => r.ReservationRooms)
                        .ThenInclude(rr => rr.Room)
                            .ThenInclude(room => room.RoomType)
                    .Where(r => targetHotelIds.Contains(r.HotelId))
                    .OrderByDescending(r => r.CreatedDate)
                    .Select(r => new
                    {
                        r.ReservationId,
                        r.GuestName,
                        HotelName = r.Hotel.HotelName,
                        NumberOfGuests = r.ReservationRooms.Sum(rr => rr.Room.RoomType.MaxGuests), 
                        RoomTypes = r.ReservationRooms.Select(rr => rr.Room.RoomType.RoomTypeName).Distinct().ToList(),
                        RoomNumbers = r.ReservationRooms.Select(rr => rr.Room.RoomNumber).ToList(),
                        r.CheckInDate,
                        r.CheckOutDate,
                        r.Status,
                        PaymentStatus = _context.Invoices
                            .Where(i => i.ReservationId == r.ReservationId)
                            .Select(i => i.PaymentStatus)
                            .FirstOrDefault() ?? "Pending",
                        TotalPrice = _context.Invoices
                            .Where(i => i.ReservationId == r.ReservationId)
                            .Select(i => i.GrandTotal)
                            .FirstOrDefault() != 0 
                                ? _context.Invoices.Where(i => i.ReservationId == r.ReservationId).Select(i => i.GrandTotal).FirstOrDefault()
                                : r.ReservationRooms.Sum(rr => rr.Room.RoomType.BasePrice) * (decimal)(r.CheckOutDate.DayNumber - r.CheckInDate.DayNumber)
                    })
                    .ToListAsync();

                return Ok(reservations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching reservations", error = ex.Message });
            }
        }

        [HttpGet("breakdown")]
        public async Task<IActionResult> GetManagerHotelBreakdown()
        {
            var email = GetUserEmail();
            if (string.IsNullOrEmpty(email)) return Unauthorized();
            var assignedHotels = await _context.UserHotelAssignments
                .Include(x => x.User)
                .Include(h => h.Hotel)
                .Where(x => x.User.Email == email && x.IsActive)
                .Select(x => x.Hotel) 
                .Where(h => h != null)
                .ToListAsync();

            if (!assignedHotels.Any()) return Ok(new List<object>());

            var result = new List<object>();
            var today = DateOnly.FromDateTime(DateTime.Now);

            var allReservations = await _context.Reservations
                .Include(r => r.ReservationRooms)
                .Where(r => assignedHotels.Select(h => h.HotelId).Contains(r.HotelId))
                .ToListAsync();

            foreach (var hotel in assignedHotels)
            {
                var totalRooms = await _context.Rooms.CountAsync(r => r.HotelId == hotel.HotelId);
                
                var hotelRes = allReservations.Where(r => r.HotelId == hotel.HotelId).ToList();
                
                var activeRes = hotelRes.Where(r => {
                    if (string.IsNullOrWhiteSpace(r.Status)) return false;
                    var s = r.Status.ToLower().Trim();
                    if (s == "checkedin") return true;
                    if (s == "cancelled" || s == "checkedout" || s == "rejected") return false;
                    return r.CheckInDate <= today && r.CheckOutDate >= today;
                }).ToList();

                var occupiedRoomsCount = activeRes.Sum(r => r.ReservationRooms.Count);

                var totalRevenue = await _context.Invoices
                    .Include(i => i.Reservation)
                    .Where(i => i.Reservation.HotelId == hotel.HotelId && i.PaymentStatus == "Paid")
                    .SumAsync(i => (decimal?)i.GrandTotal) ?? 0;

                double occupancy = 0;
                if (totalRooms > 0)
                {
                    occupancy = (double)occupiedRoomsCount / totalRooms * 100;
                }

                result.Add(new
                {
                    HotelId = hotel.HotelId,
                    HotelName = hotel.HotelName,
                    City = hotel.City,
                    TotalRooms = totalRooms,
                    ActiveGuests = occupiedRoomsCount, 
                    TotalRevenue = totalRevenue,
                    OccupancyRate = Math.Round(occupancy, 2)
                });
            }
            return Ok(result.OrderByDescending(x => ((dynamic)x).TotalRevenue).ToList());
        }
    }
}
