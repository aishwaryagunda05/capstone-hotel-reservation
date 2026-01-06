using System;
using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Api.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        public int UserId { get; set; } 
        public string Message { get; set; } = string.Empty;

        public string Type { get; set; } = "Info"; 

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
