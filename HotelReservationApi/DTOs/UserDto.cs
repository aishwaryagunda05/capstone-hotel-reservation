using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Api.DTOs
{
    public class UserDto
    {
        public int? UserId { get; set; }   // null for Create

        [Required]
        [MinLength(3)]
        public string FullName { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [RegularExpression(@"^([6-9]\d{9})$",
            ErrorMessage = "Phone must be 10 digits and start with 6-9")]
        public string Phone { get; set; } = null!;

        [Required]
        public string Role { get; set; } = null!;

        // 🔹 Required only when creating
        public string? Password { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
