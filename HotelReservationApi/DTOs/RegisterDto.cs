using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Api.DTOs
{
    public class RegisterDto
    {
        [Required]
        [MinLength(3)]
        public string FullName { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$",
            ErrorMessage = "Password must be at least 6 characters & include upper, lower & number")]
        public string Password { get; set; } = null!;

        [Required]
        [RegularExpression(@"^([6-9]\d{9})$",
            ErrorMessage = "Phone must be 10 digits starting with 6-9")]
        public string? Phone { get; set; }
    }
}
