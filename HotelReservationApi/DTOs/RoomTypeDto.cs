namespace HotelReservation.Api.DTOs
{
    public class RoomTypeDto
    {
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = null!;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public int MaxGuests { get; set; }
        public int HotelId { get; set; }
        public string? Amenities { get; set; }
        public string? Features { get; set; }
    }
}
