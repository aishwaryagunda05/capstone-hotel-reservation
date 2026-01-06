using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HotelReservation.Api.Models;

public class UserHotelAssignment
{
    [Key]
    public int UserHotelAssignmentId { get; set; }

    [Required]
    public int UserId { get; set; }
    public User? User { get; set; }

    [Required]
    public int HotelId { get; set; }
    public Hotel? Hotel { get; set; }

    public bool IsActive { get; set; } = true;
}
