namespace HotelReservation.Api.DTOs
{
    public class AvailableRoomDto
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = null!;
        public string RoomType { get; set; } = null!;
        public int MaxGuests { get; set; }

        public decimal PricePerNight { get; set; }
        public decimal TotalPrice { get; set; }

        public List<PriceBreakdownDto> Breakdown { get; set; } = new();
    }

    public class PriceBreakdownDto
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
        public decimal Rate { get; set; }
    }

}
