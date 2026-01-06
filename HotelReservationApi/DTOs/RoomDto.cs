namespace HotelReservation.Api.DTOs
{
    public class RoomDto
    {
        public int RoomId { get; set; }
        public int HotelId { get; set; }
        public int RoomTypeId { get; set; }
        public string RoomNumber { get; set; } = null!;
        public string Status { get; set; } = null!;
        public decimal? Price { get; set; }
        public bool IsActive { get; set; }
    }
}
