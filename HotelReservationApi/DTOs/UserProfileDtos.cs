namespace HotelReservation.Api.DTOs
{
    public class UserProfileResponseDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Role { get; set; }
    }

    public class UpdateProfileDto
    {
        public string FullName { get; set; }
        public string Email { get; set; } // 🔥 Added Email
        public string Phone { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; } 
    }
}
