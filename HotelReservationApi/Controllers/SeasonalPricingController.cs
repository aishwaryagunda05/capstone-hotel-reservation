using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelReservation.Api.Data;
using HotelReservation.Api.DTOs;
using HotelReservation.Api.Models;

namespace HotelReservation.Api.Controllers
{
    [ApiController]
    [Route("api/admin/seasonalpricing")]
    public class SeasonalPricingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SeasonalPricingController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SeasonalPriceDto>>> GetAll()
        {
            var data = await _context.SeasonalPrices
                .Select(x => new SeasonalPriceDto
                {
                    SeasonalPriceId = x.SeasonalPriceId,
                    HotelId = x.HotelId,
                    RoomTypeId = x.RoomTypeId,
                    StartDate = x.StartDate,
                    EndDate = x.EndDate,
                    PricePerNight = x.PricePerNight
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SeasonalPriceDto>> Get(int id)
        {
            var s = await _context.SeasonalPrices.FindAsync(id);

            if (s == null)
                return NotFound();

            return new SeasonalPriceDto
            {
                SeasonalPriceId = s.SeasonalPriceId,
                HotelId = s.HotelId,
                RoomTypeId = s.RoomTypeId,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                PricePerNight = s.PricePerNight
            };
        }

        [HttpPost]
        public async Task<IActionResult> Create(SeasonalPriceDto dto)
        {
            var entity = new SeasonalPrice
            {
                HotelId = dto.HotelId,
                RoomTypeId = dto.RoomTypeId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                PricePerNight = dto.PricePerNight
            };

            _context.SeasonalPrices.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(entity.SeasonalPriceId);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, SeasonalPriceDto dto)
        {
            var s = await _context.SeasonalPrices.FindAsync(id);

            if (s == null)
                return NotFound();
            bool hotelExists = await _context.Hotels.AnyAsync(h => h.HotelId == dto.HotelId);
            if (!hotelExists)
                return BadRequest("Invalid HotelId. Hotel does not exist.");

            bool roomTypeExists = await _context.RoomTypes.AnyAsync(r => r.RoomTypeId == dto.RoomTypeId);
            if (!roomTypeExists)
                return BadRequest("Invalid RoomTypeId. Room type does not exist.");

            // 🔹 Update values
            s.HotelId = dto.HotelId;
            s.RoomTypeId = dto.RoomTypeId;
            s.StartDate = dto.StartDate;
            s.EndDate = dto.EndDate;
            s.PricePerNight = dto.PricePerNight;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var s = await _context.SeasonalPrices.FindAsync(id);

            if (s == null)
                return NotFound();

            _context.SeasonalPrices.Remove(s);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
