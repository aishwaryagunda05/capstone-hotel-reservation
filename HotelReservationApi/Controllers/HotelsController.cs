using HotelReservation.Api.DTOs;
using HotelReservation.Api.Models;
using HotelReservation.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HotelsController : ControllerBase
    {
        private readonly IHotelRepository _repo;
        private readonly Data.AppDbContext _context; 

        public HotelsController(IHotelRepository repo, Data.AppDbContext context)
        {
            _repo = repo;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HotelDto>>> GetHotels()
        {
            var hotels = await _repo.GetAllHotelsAsync();

            return Ok(hotels.Select(h => new HotelDto
            {
                HotelId = h.HotelId,
                HotelName = h.HotelName,
                City = h.City,
                Pincode = h.Pincode,
                State = h.State,
                Address = h.Address,
                Phone = h.Phone,
                Email = h.Email,
                CreatedDate = h.CreatedDate
            }));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HotelDto>> GetHotel(int id)
        {
            var h = await _repo.GetHotelByIdAsync(id);
            if (h == null) return NotFound();

            return Ok(new HotelDto
            {
                HotelId = h.HotelId,
                HotelName = h.HotelName,
                City = h.City,
                Pincode = h.Pincode,
                State = h.State,
                Address = h.Address,
                Phone = h.Phone,
                Email = h.Email,
                CreatedDate = h.CreatedDate
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<HotelDto>> CreateHotel(HotelDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var exists = await _context.Hotels.AnyAsync(h => 
                h.HotelName == dto.HotelName && 
                h.City == dto.City && 
                h.Pincode == dto.Pincode);

            if (exists)
            {
                return Conflict(new { message = "A hotel with the same name, city, and pincode already exists." });
            }

            var hotel = new Hotel
            {
                HotelName = dto.HotelName,
                City = dto.City,
                Pincode = dto.Pincode,
                State = dto.State,
                Address = dto.Address,
                Phone = dto.Phone,
                Email = dto.Email
            };

            var created = await _repo.CreateHotelAsync(hotel);

            dto.HotelId = created.HotelId;
            dto.CreatedDate = created.CreatedDate;

            return CreatedAtAction(nameof(GetHotel),
                new { id = created.HotelId },
                dto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateHotel(int id, HotelDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var hotel = new Hotel
            {
                HotelName = dto.HotelName,
                City = dto.City,
                Pincode = dto.Pincode,
                State = dto.State,
                Address = dto.Address,
                Phone = dto.Phone,
                Email = dto.Email
            };

            var updated = await _repo.UpdateHotelAsync(id, hotel);

            if (updated == null) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteHotel(int id)
        {
            var ok = await _repo.DeleteHotelAsync(id);
            if (!ok) return NotFound();

            return NoContent();
        }
    }
}
