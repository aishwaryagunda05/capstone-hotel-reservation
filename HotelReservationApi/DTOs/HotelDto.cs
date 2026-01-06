using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Api.DTOs
{
    public class HotelDto
    {
        public int? HotelId { get; set; }

        [Required]
        [MaxLength(200)]
        public string HotelName { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = null!;

        [MaxLength(10)]
        public string? Pincode { get; set; }

        [MaxLength(50)]
        public string? State { get; set; }

        [MaxLength(300)]
        public string? Address { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        [EmailAddress]
        public string? Email { get; set; }

        public DateTime? CreatedDate { get; set; }

    }
}
