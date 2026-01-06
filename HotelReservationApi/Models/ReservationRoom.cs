using HotelReservation.Api.Models;
using System.ComponentModel.DataAnnotations.Schema;

public class ReservationRoom
{
    public int ReservationRoomId { get; set; }

    public int ReservationId { get; set; }
    public Reservation Reservation { get; set; } = null!;

    public int RoomId { get; set; }
    public Room Room { get; set; } = null!;

    [Column(TypeName = "decimal(10,2)")]
    public decimal PricePerNight { get; set; }

    public int Nights { get; set; }

    [Column(TypeName = "decimal(12,2)")]
    public decimal TotalAmount { get; set; }
}
