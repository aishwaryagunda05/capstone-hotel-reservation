public class SeasonalPriceDto
{
    public int SeasonalPriceId { get; set; }
    public int HotelId { get; set; }
    public int RoomTypeId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal PricePerNight { get; set; }
}
