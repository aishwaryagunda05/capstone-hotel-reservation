using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Api.DTOs
{
    public class CreateServiceRequestDto
    {
        [Required]
        public string RequestType { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public int? RoomId { get; set; }
    }

    public class ServiceRequestResponseDto
    {
        public int RequestId { get; set; }
        public string RequestType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateOnly CreatedAt { get; set; }
        public int ReservationId { get; set; }
        public string RoomNumber { get; set; } = string.Empty; 
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
        public string HotelName { get; set; } = string.Empty;
    }
}
