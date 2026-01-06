using HotelReservation.Api.DTOs;
using HotelReservation.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelReservation.Api.Controllers
{
    [ApiController]
    [Route("api/admin/assignments")]
    [Authorize(Roles = "Admin")]
    public class UserHotelAssignmentsController : ControllerBase
    {
        private readonly UserHotelAssignmentService _service;

        public UserHotelAssignmentsController(UserHotelAssignmentService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Assign(UserHotelAssignmentDto dto)
        {
            var created = await _service.AssignAsync(dto);
            return CreatedAtAction(nameof(GetAll), created);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> ToggleStatus(int id, bool isActive)
        {
            await _service.ToggleActiveAsync(id, isActive);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
