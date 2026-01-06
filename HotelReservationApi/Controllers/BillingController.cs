using HotelReservation.Api.Services;
using HotelReservation.Api.DTOs; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelReservation.Api.Controllers
{
    [ApiController]
    [Route("api/billing")]
    [Authorize]
    public class BillingController : ControllerBase
    {
        private readonly BillingService _service;

        public BillingController(BillingService service)
        {
            _service = service;
        }

        [HttpGet("invoice-preview/{reservationId}")]
        public async Task<IActionResult> GetInvoicePreview(int reservationId)
        {
            var result = await _service.GetInvoicePreview(reservationId);
            if (result == null) return NotFound("Reservation not found.");
            
            return Ok(result);
        }

        [HttpPost("pay")]
        public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequestDto request)
        {
            try 
            {
                var result = await _service.ProcessPayment(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpGet("guest/{userId}")]
        public async Task<IActionResult> GetInvoicesByGuest(int userId)
        {
            var invoices = await _service.GetInvoicesByGuest(userId);
            return Ok(invoices);
        }
    }

    public class PaymentRequestDto
    {
        public int ReservationId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMode { get; set; } = "Card";
        public string? TransactionRef { get; set; }
    }
}
