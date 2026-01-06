using HotelReservation.Api.DTOs;
using HotelReservation.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HotelReservation.Api.Controllers
{
    [ApiController]
    [Route("api/manager")]
    [Authorize(Roles = "Manager,Receptionist")]
    public class ManagerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ManagerController(AppDbContext context)
        {
            _context = context;
        }

        private string? GetUserEmail()
        {
            return User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.Identity?.Name;
        }

        [HttpGet("hotels")]
        public async Task<IActionResult> GetMyHotels()
        {
            Console.WriteLine("[ManagerController] GET /hotels called");
            try 
            {
                var email = GetUserEmail();
                Console.WriteLine($"[ManagerController] Email found: {email}");

                if (string.IsNullOrEmpty(email)) 
                {
                    Console.WriteLine("[ManagerController] Unauthorized: email is null");
                    return Unauthorized();
                }

                Console.WriteLine($"[ManagerController] Querying assignments for Email: {email}...");
                var assignments = await _context.UserHotelAssignments
                    .AsNoTracking()
                    .Include(x => x.User)
                    .Where(x => x.User.Email == email && x.IsActive && x.Hotel != null)
                    .Include(x => x.Hotel)
                    .Select(x => new 
                    {
                        x.HotelId,
                        HotelName = x.Hotel.HotelName,
                        City = x.Hotel.City,
                        Address = x.Hotel.Address
                    })
                    .ToListAsync();
                
                Console.WriteLine($"[ManagerController] Assignments found: {assignments.Count}");
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ManagerController] ERROR: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
