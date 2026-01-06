namespace HotelReservation.Api.DTOs
{
    public class UserHotelAssignmentDto
    {
        public int? UserHotelAssignmentId { get; set; }
        public int UserId { get; set; }
        public int HotelId { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
