public class ReservationResponseDto
{
    public int ReservationId { get; set; }
    public string GuestName { get; set; } = null!;
    public DateOnly CheckIn { get; set; }
    public DateOnly CheckOut { get; set; }
    public string Status { get; set; } = null!;
    public decimal TotalAmount { get; set; }

    public string HotelName { get; set; } = "Unknown Hotel";
    public string HotelAddress { get; set; } = "";
    public string HotelCity { get; set; } = "";
    public string PaymentStatus { get; set; } = "Pending";
    public List<ReservationRoomDto> Rooms { get; set; } = new();
}

public class ReservationRoomDto
{
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = null!;
    public string RoomType { get; set; } = null!;
    public decimal Price { get; set; }
}
