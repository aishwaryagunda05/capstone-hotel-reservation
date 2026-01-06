using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Api.Models
{
    public class RoomType
    {
        [Key]
        public int RoomTypeId { get; set; }

        [Required]
        [MaxLength(100)]
        public string RoomTypeName { get; set; } = null!;

        [MaxLength(300)]
        public string? Description { get; set; }

        public decimal BasePrice { get; set; }

        public int MaxGuests { get; set; }

        public string? Amenities { get; set; }

        public string? Features { get; set; }

        public int HotelId { get; set; }
        public Hotel? Hotel { get; set; }
    }
}
