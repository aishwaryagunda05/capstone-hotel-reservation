using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelReservation.Api.Models
{
    public class Room
    {
        [Key]
        public int RoomId { get; set; }

        public int HotelId { get; set; }
        public Hotel Hotel { get; set; } = null!;

        public int RoomTypeId { get; set; }
        public RoomType RoomType { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string RoomNumber { get; set; } = null!;

        [Required]
        public string Status { get; set; } = "Available";

        [NotMapped]
        public decimal? Price { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
