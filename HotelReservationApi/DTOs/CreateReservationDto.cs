namespace HotelReservation.Api.DTOs
{
    public class CreateReservationDto
    {
        public int HotelId { get; set; }
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
        public List<int> RoomIds { get; set; } = new();
        public int Guests { get; set; } // Added for capacity validation
    }
}
