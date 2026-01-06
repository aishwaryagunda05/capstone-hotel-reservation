using HotelReservation.Api.DTOs;
using HotelReservation.Api.Data;
using HotelReservation.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HotelReservation.Api.Controllers
{
    [ApiController]
    [Route("api/manager/rooms")]
    [Authorize(Roles = "Manager")]
    public class ManagerRoomsController : ControllerBase
    {
        private readonly RoomService _service;
        private readonly AppDbContext _context;

        public ManagerRoomsController(RoomService service, AppDbContext context)
        {
            _service = service;
            _context = context;
        }
        private async Task<int?> GetUserIdAsync()
        {
            var possibleClaims = new[]
            {
                "id", "userId", "uid", ClaimTypes.NameIdentifier, "sub"
            };

            foreach (var key in possibleClaims)
            {
                var c = User?.FindFirst(key);
                if (c != null && int.TryParse(c.Value, out var uid))
                    return uid;
            }
            var email = User?.FindFirst(ClaimTypes.Email)?.Value ??
                        User?.FindFirst("email")?.Value ??
                        User?.Identity?.Name;

            if (string.IsNullOrWhiteSpace(email)) return null;

            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Email == email);
            return user?.UserId;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyRooms()
        {
            var managerId = await GetUserIdAsync();
            if (managerId == null) return Unauthorized();

            try
            {
                var rooms = await _service.GetRoomsByManagerIdAsync(managerId.Value);
                return Ok(rooms);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("hotel/{hotelId}")]
        public async Task<IActionResult> GetRoomsByHotel(int hotelId)
        {
            var managerId = await GetUserIdAsync();
            if (managerId == null) return Unauthorized();

            try
            {
                var rooms = await _service.GetRoomsByManagerAndHotelIdAsync(managerId.Value, hotelId);
                return Ok(rooms);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateRoom([FromBody] RoomDto dto)
        {
            var managerId = await GetUserIdAsync();
            if (managerId == null) return Unauthorized("Failed to identify user from token claims.");

            try
            {
                Console.WriteLine($"[ManagerRooms] Creating Room: ManagerID={managerId}, HotelID={dto.HotelId}");
                await _service.CreateForManagerAsync(managerId.Value, dto);
                return Ok(new { message = "Room created successfully" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized($"You are not authorized to add rooms to this hotel. (ManagerID={managerId}, TargetHotelID={dto.HotelId})");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] RoomDto dto)
        {
            var managerId = await GetUserIdAsync();
            if (managerId == null) return Unauthorized();

            try
            {
                await _service.UpdateForManagerAsync(managerId.Value, id, dto);
                return Ok(new { message = "Room updated successfully" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("You are not authorized to update this room.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var managerId = await GetUserIdAsync();
            if (managerId == null) return Unauthorized();

            try
            {
                await _service.DeleteForManagerAsync(managerId.Value, id);
                return Ok(new { message = "Room deleted successfully" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("You are not authorized to delete this room.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
