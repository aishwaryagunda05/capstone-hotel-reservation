using HotelReservation.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HotelReservation.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Controllers
{
    [ApiController]
    [Route("api/manager/reservations")]
    [Authorize(Roles = "Manager,Receptionist")]
    public class ManagerReservationsController : ControllerBase
    {
        private readonly ReservationApprovalService _service;
        private readonly AppDbContext _context;
        private readonly NotificationService _notificationService;

        public ManagerReservationsController(
            ReservationApprovalService service,
            AppDbContext context,
            NotificationService notificationService)
        {
            _service = service;
            _context = context;
            _notificationService = notificationService;
        }

        private async Task<int?> GetUserIdAsync()
        {
            var possibleClaims = new[]
            {
                "id",
                "userId",
                "uid",
                ClaimTypes.NameIdentifier,
                "sub"
            };

            foreach (var key in possibleClaims)
            {
                var c = User?.FindFirst(key);
                if (c != null && int.TryParse(c.Value, out var uid))
                    return uid;
            }

            var email =
                User?.FindFirst(ClaimTypes.Email)?.Value ??
                User?.FindFirst("email")?.Value ??
                User?.Identity?.Name;

            if (string.IsNullOrWhiteSpace(email))
                return null;

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Email == email);

            return user?.UserId;
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var managerId = await GetUserIdAsync();
            if (managerId is null)
                return Unauthorized("User not found");

            var list = await _service.GetPendingReservationsForManager(managerId.Value);

            return Ok(list.Select(r => new
            {
                r.ReservationId,
                Guest = r.GuestName,
                Email = r.User.Email,
                Hotel = r.Hotel.HotelName,
                CheckIn = r.CheckInDate,
                CheckOut = r.CheckOutDate,
                Rooms = r.ReservationRooms.Select(x => new
                {
                    x.Room.RoomNumber,
                    x.PricePerNight,
                    x.TotalAmount
                }),
                r.Status
            }));
        }

        [HttpPost("{reservationId}/approve")]
        public async Task<IActionResult> Approve(int reservationId)
        {
            var managerId = await GetUserIdAsync();
            if (managerId is null)
                return Unauthorized("User not found");

            var result = await _service.Approve(reservationId, managerId.Value);
            if (result == "Success")
            {
                 var reservation = await _context.Reservations
                     .Include(r => r.Hotel)
                     .FirstOrDefaultAsync(r => r.ReservationId == reservationId);

                 if (reservation != null)
                 {
                     await _notificationService.CreateNotification(
                         reservation.UserId,
                         $"Manager confirmed your booking at {reservation.Hotel.HotelName}. Please wait until receptionist checks you in.",
                         "Success"
                     );
                 }

                 return Ok(new { message = "Approved" });
            }
            
            return BadRequest($"Failed: {result}");
        }

        [HttpPost("{reservationId}/reject")]
        public async Task<IActionResult> Reject(int reservationId)
        {
            var managerId = await GetUserIdAsync();
            if (managerId is null)
                return Unauthorized("User not found");

            var ok = await _service.Reject(reservationId, managerId.Value);
            if (ok)
            {
                var reservation = await _context.Reservations
                    .Include(r => r.Hotel)
                    .FirstOrDefaultAsync(r => r.ReservationId == reservationId);

                if (reservation != null)
                {
                    await _notificationService.CreateNotification(
                        reservation.UserId,
                        $"Your booking at {reservation.Hotel.HotelName} was rejected by the manager.",
                        "Error"
                    );
                }

                return Ok(new { message = "Rejected" });
            }
            
            return BadRequest(new { message = "Not allowed" });
        }
    }
}
