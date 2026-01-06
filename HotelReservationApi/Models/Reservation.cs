using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Api.Models
{
    public class Reservation
    {
        [Key]
        public int ReservationId { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int HotelId { get; set; }
        public Hotel Hotel { get; set; } = null!;

        [Required]
        public string GuestName { get; set; } = null!;

        public string? GuestPhone { get; set; }

        [Required]
        public DateOnly CheckInDate { get; set; }

        [Required]
        public DateOnly CheckOutDate { get; set; }

        public string Status { get; set; } = "Booked";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateOnly? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }
        public int? CancelledByUserId { get; set; }

        public List<ReservationRoom> ReservationRooms { get; set; } = new();

        [Range(0, 999999.99)]
        public decimal? BreakageFee { get; set; }
    }
}
