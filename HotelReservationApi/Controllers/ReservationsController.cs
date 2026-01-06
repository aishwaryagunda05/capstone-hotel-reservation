using HotelReservation.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HotelReservation.Api.Services;

namespace HotelReservation.Api.Controllers
{
    [ApiController]
    [Route("api/reservations")]
    public class ReservationsController : ControllerBase
    {
        private readonly ReservationService _service;
        private readonly BillingService _billingService;
        private readonly NotificationService _notificationService;
        private readonly ServiceRequestService _requestService;
        private readonly HotelReservation.Api.Repositories.IInvoiceRepository _invoiceRepo;

        public ReservationsController(
            ReservationService service, 
            BillingService billingService,
            NotificationService notificationService,
            ServiceRequestService requestService,
            HotelReservation.Api.Repositories.IInvoiceRepository invoiceRepo)
        {
            _service = service;
            _billingService = billingService;
            _notificationService = notificationService;
            _requestService = requestService;
            _invoiceRepo = invoiceRepo;
        }

        [HttpPost("search")]
        [Authorize]
        public async Task<IActionResult> Search(RoomSearchRequestDto dto)
            => Ok(await _service.SearchRooms(dto));

        [HttpGet("receptionist/billings")]
        [Authorize(Roles = "Receptionist")]
        public async Task<IActionResult> GetReceptionistBillings(
            [FromServices] UserHotelAssignmentService assignmentService)
        {
            int userId = await GetUserIdFromToken();
            int? hotelId = await assignmentService.GetHotelIdForUser(userId);

            if (hotelId == null)
                return BadRequest(new { message = "You are not assigned to any hotel" });

            var list = await _service.GetReservationsByHotel(hotelId.Value);
            var relevant = list.Where(r => 
                string.Equals(r.Status, "CheckedIn", StringComparison.OrdinalIgnoreCase) || 
                string.Equals(r.Status, "CheckedOut", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(r.Status, "Confirmed", StringComparison.OrdinalIgnoreCase)).ToList();

            var response = new List<ReservationResponseDto>();

            foreach (var r in relevant)
            {
                var invoice = await _invoiceRepo.GetByReservationId(r.ReservationId);
                var status = invoice?.PaymentStatus ?? "Pending";

                response.Add(new ReservationResponseDto
                {
                    ReservationId = r.ReservationId,
                    GuestName = r.GuestName,
                    Status = r.Status,
                    TotalAmount = r.ReservationRooms.Sum(x => x.TotalAmount) + (r.BreakageFee ?? 0), 
                    CheckIn = r.CheckInDate,
                    CheckOut = r.CheckOutDate,
                    HotelName = r.Hotel?.HotelName ?? "Unknown Hotel",
                    HotelAddress = r.Hotel?.Address ?? "",
                    HotelCity = r.Hotel?.City ?? "",
                    PaymentStatus = status,
                    Rooms = r.ReservationRooms.Select(rr => new ReservationRoomDto
                    {
                        RoomId = rr.Room?.RoomId ?? 0,
                        RoomNumber = rr.Room?.RoomNumber ?? "N/A",
                        RoomType = rr.Room?.RoomType?.RoomTypeName ?? "Standard",
                        Price = rr.PricePerNight
                    }).ToList()
                });
            }

            return Ok(response);
        }
        [HttpPost]
        [Authorize(Roles = "Guest")]
        public async Task<IActionResult> Book(CreateReservationDto dto)
        {
            int userId = await GetUserIdFromToken();
            var id = await _service.CreateReservation(userId, dto);

            return Ok(new { reservationId = id, status = "pending" });
        }

        [HttpGet("guest/{userId}")]
        [Authorize(Roles = "Guest")]
        public async Task<IActionResult> GetByGuestWithPayment(int userId)
        {
            var list = await _service.GetReservationsByGuest(userId);
            var allInvoices = await _billingService.GetInvoicesByGuest(userId);

            var invoiceStatusMap = allInvoices
                .GroupBy(i => i.ReservationId)
                .ToDictionary(g => g.Key, g => g.First().PaymentStatus);

            return Ok(list.Select(r => new ReservationResponseDto
            {
                ReservationId = r.ReservationId,
                GuestName = r.GuestName,
                Status = r.Status,
                TotalAmount = r.ReservationRooms.Sum(x => x.TotalAmount),
                CheckIn = r.CheckInDate,
                CheckOut = r.CheckOutDate,
                HotelName = r.Hotel?.HotelName ?? "Unknown Hotel",
                HotelAddress = r.Hotel?.Address ?? "",
                HotelCity = r.Hotel?.City ?? "",
                PaymentStatus = invoiceStatusMap.TryGetValue(r.ReservationId, out var status) ? status : "Pending",
                Rooms = r.ReservationRooms.Select(rr => new ReservationRoomDto
                {
                    RoomId = rr.Room?.RoomId ?? 0,
                    RoomNumber = rr.Room?.RoomNumber ?? "N/A",
                    RoomType = rr.Room?.RoomType?.RoomTypeName ?? "Standard",
                    Price = rr.PricePerNight
                }).ToList()
            }));
        }


        [HttpPost("{id}/cancel")]
        [Authorize(Roles = "Guest")]
        public async Task<IActionResult> Cancel(int id, [FromBody] CancelReservationDto dto)
        {
            int userId = await GetUserIdFromToken();
            
            Console.WriteLine($"Cancelling Reservation {id}. Reason: {dto.Reason}");

            var success = await _service.CancelReservation(id, userId);

            if (!success)
                return BadRequest(new { message = "Cannot cancel reservation" });

            return Ok(new { message = "Cancelled" });
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAllReservations();

            return Ok(list.Select(r => new ReservationResponseDto
            {
                ReservationId = r.ReservationId,
                GuestName = r.GuestName,
                Status = r.Status,
                TotalAmount = r.ReservationRooms.Sum(x => x.TotalAmount),
                CheckIn = r.CheckInDate,
                CheckOut = r.CheckOutDate,
                HotelName = r.Hotel?.HotelName ?? "Unknown Hotel",
                HotelAddress = r.Hotel?.Address ?? "",
                HotelCity = r.Hotel?.City ?? "",
                Rooms = r.ReservationRooms.Select(rr => new ReservationRoomDto
                {
                    RoomId = rr.Room?.RoomId ?? 0,
                    RoomNumber = rr.Room?.RoomNumber ?? "N/A",
                    RoomType = rr.Room?.RoomType?.RoomTypeName ?? "Standard",
                    Price = rr.PricePerNight
                }).ToList()
            }));
        }
        private async Task<int> GetUserIdFromToken()
        {
            var idValue =
                User.FindFirstValue("id") ??
                User.FindFirstValue("uid") ??
                User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirstValue("nameid");

            if (int.TryParse(idValue, out int uid))
                return uid;
            var email =
                User.FindFirstValue("email") ??
                User.FindFirstValue(ClaimTypes.Email) ??
                User.FindFirstValue("preferred_username") ??
                User.FindFirstValue("unique_name") ??
                User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(email))
                throw new UnauthorizedAccessException("User identity missing");

            var user = await _service.GetUserByEmail(email);

            if (user == null)
                throw new UnauthorizedAccessException("User not found");

            return user.UserId;
        }

        [HttpGet("receptionist/my-hotel")]
        [Authorize(Roles = "Receptionist")]
        public async Task<IActionResult> GetMyHotelReservations(
            [FromServices] UserHotelAssignmentService assignmentService)
        {
            int userId = await GetUserIdFromToken();
            int? hotelId = await assignmentService.GetHotelIdForUser(userId);

            if (hotelId == null)
                return BadRequest(new { message = "You are not assigned to any hotel" });

            var list = await _service.GetReservationsByHotel(hotelId.Value);

            var relevant = list.Where(r => 
                string.Equals(r.Status, "Confirmed", StringComparison.OrdinalIgnoreCase) || 
                string.Equals(r.Status, "Booked", StringComparison.OrdinalIgnoreCase) || 
                string.Equals(r.Status, "Pending", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(r.Status, "CheckedIn", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(r.Status, "CheckedOut", StringComparison.OrdinalIgnoreCase)).ToList();

            return Ok(relevant.Select(r => new ReservationResponseDto
            {
                ReservationId = r.ReservationId,
                GuestName = r.GuestName,
                Status = r.Status,
                TotalAmount = r.ReservationRooms.Sum(x => x.TotalAmount),
                CheckIn = r.CheckInDate,
                CheckOut = r.CheckOutDate,
                HotelName = r.Hotel?.HotelName ?? "Unknown Hotel",
                HotelAddress = r.Hotel?.Address ?? "",
                HotelCity = r.Hotel?.City ?? "",
                Rooms = r.ReservationRooms.Select(rr => new ReservationRoomDto
                {
                    RoomId = rr.Room?.RoomId ?? 0,
                    RoomNumber = rr.Room?.RoomNumber ?? "N/A",
                    RoomType = rr.Room?.RoomType?.RoomTypeName ?? "Standard",
                    Price = rr.PricePerNight
                }).ToList()
            }));
        }


        [HttpPost("{id}/checkin")]
        [Authorize(Roles = "Receptionist")]
        public async Task<IActionResult> CheckIn(int id)
        {
            try
            {
                var success = await _service.CheckInReservation(id);

                if (!success)
                    return BadRequest(new { message = "Cannot check in. Reservation not found or wrong status." });

                var r = await _service.GetById(id);
                if (r != null)
                {
                     await _notificationService.CreateNotification(
                         r.UserId,
                         $"Welcome to {r.Hotel.HotelName}! You have been checked in.",
                         "Info"
                     );
                }

                return Ok(new { message = "Checked In Successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/checkout")]
        [Authorize(Roles = "Receptionist")]
        public async Task<IActionResult> CheckOut(int id, [FromBody] CheckOutDto? dto = null)
        {
            decimal breakageFee = dto?.BreakageFee ?? 0;
            var success = await _service.CheckOutReservation(id, breakageFee);

            if (!success)
                return BadRequest(new { message = "Cannot check out. Reservation not found or wrong status." });
            var r = await _service.GetById(id); 
            if (r != null)
            {
                await _notificationService.CreateNotification(
                    r.UserId,
                    $"Thank you for staying at {r.Hotel.HotelName}! Checkout Complete.",
                    "Info"
                );
            }

            return Ok(new { message = "Checked Out Successfully" });
        }

        [HttpPost("walkin")]
        [Authorize(Roles = "Receptionist")]
        public async Task<IActionResult> CreateWalkIn([FromBody] CreateWalkInReservationDto dto)
        {
            var id = await _service.CreateReservation(dto.GuestUserId, dto);
           
            await _service.ConfirmReservation(id);
            
            return Ok(new { reservationId = id, message = "Walk-in reservation confirmed" });
        }

        [HttpGet("receptionist/info")]
        [Authorize(Roles = "Receptionist")]
        public async Task<IActionResult> GetMyAssignedHotelInfo(
            [FromServices] UserHotelAssignmentService assignmentService)
        {
            int userId = await GetUserIdFromToken();
            int? hotelId = await assignmentService.GetHotelIdForUser(userId);

            if (hotelId == null)
                return BadRequest(new { message = "You are not assigned to any hotel" });

            return Ok(new { hotelId = hotelId.Value });
        }


        public class CheckOutDto
        {
            public decimal BreakageFee { get; set; }
        }
    }
}
