using HotelReservation.Api.Services;
using HotelReservation.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelReservationApi.Controllers
{
    [ApiController]
    [Route("api/requests")]
    public class ServiceRequestsController : ControllerBase
    {
        private readonly ServiceRequestService _service;
        private readonly NotificationService _notificationService;

        public ServiceRequestsController(ServiceRequestService service, NotificationService notificationService)
        {
            _service = service;
            _notificationService = notificationService;
        }

        [HttpPost]
        [Authorize(Roles = "Guest")]
        public async Task<IActionResult> Create([FromBody] CreateServiceRequestDto dto)
        {
            var userId = GetUserId();
            var requestId = await _service.CreateRequest(userId, dto);

            if (requestId == null)
            {
                return BadRequest(new { message = "Service available only for guests currently Checked In." });
            }

            return Ok(new { message = "Request received", requestId = requestId });
        }

        [HttpGet("my-requests")]
        [Authorize(Roles = "Guest")]
        public async Task<IActionResult> GetMyRequests()
        {
            var userId = GetUserId();
            var requests = await _service.GetUserRequests(userId);

            var dtos = requests.Select(sr => new ServiceRequestResponseDto
            {
                RequestId = sr.RequestId,
                ReservationId = sr.ReservationId,
                RequestType = sr.RequestType,
                Description = sr.Description,
                Status = sr.Status,
                Price = sr.Price,
                CreatedAt = DateOnly.FromDateTime(sr.CreatedAt),
                RoomNumber = sr.Room?.RoomNumber ?? sr.Reservation?.ReservationRooms?.Select(rr => rr.Room?.RoomNumber).FirstOrDefault() ?? "N/A",
                CheckInDate = sr.Reservation?.CheckInDate ?? default,
                CheckOutDate = sr.Reservation?.CheckOutDate ?? default,
                HotelName = sr.Reservation?.Hotel?.HotelName ?? "Unknown"
            }).ToList();

            return Ok(dtos);
        }

        
        [HttpGet("hotel/{hotelId}")]
        [Authorize(Roles = "Receptionist")]
        public async Task<IActionResult> GetRequestsForHotel(int hotelId)
        {
            var requests = await _service.GetHotelRequests(hotelId);

            var dtos = requests.Select(sr => new
            {
                sr.RequestId,
                sr.ReservationId,
                sr.RequestType,
                sr.Description,
                sr.Status,
                sr.CreatedAt,
                GuestName = sr.Reservation?.GuestName ?? "Unknown",
                RoomNumber = sr.Room?.RoomNumber ?? sr.Reservation?.ReservationRooms?.Select(rr => rr.Room?.RoomNumber).FirstOrDefault() ?? "N/A"
            }).ToList();

            return Ok(dtos);
        }

        [HttpPost("{id}/serve")]
        [Authorize(Roles = "Receptionist")]
        public async Task<IActionResult> MarkServed(int id, [FromBody] ServeRequestDto dto)
        {
            var request = await _service.MarkAsServed(id, dto.Price);

            if (request == null) return NotFound("Request not found");

            if (request.Reservation != null)
            {
                await _notificationService.CreateNotification(
                    request.Reservation.UserId,
                    $"Your request for {request.RequestType} has been served. Charge: ₹{dto.Price}",
                    "Info"
                );
            }

            return Ok(new { message = "Marked as Served", price = request.Price });
        }
        private int GetUserId()
        {
            var idClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim != null && int.TryParse(idClaim.Value, out int id))
            {
                return id;
            }
            var uid = User.FindFirstValue("uid");
            if (uid != null && int.TryParse(uid, out int uidInt)) return uidInt;

            throw new UnauthorizedAccessException("Invalid Token");
        }
    }

    public class ServeRequestDto
    {
        public decimal Price { get; set; }
    }
}
