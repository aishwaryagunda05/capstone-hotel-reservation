using HotelReservation.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Repositories
{
    public class SeasonalPriceRepository
    {
        private readonly AppDbContext _context;

        public SeasonalPriceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SeasonalPrice>> GetAllAsync()
        {
            return await _context.SeasonalPrices.ToListAsync();
        }

        public async Task<SeasonalPrice?> GetByIdAsync(int id)
        {
            return await _context.SeasonalPrices.FindAsync(id);
        }

        public async Task AddAsync(SeasonalPrice entity)
        {
            await _context.SeasonalPrices.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.SeasonalPrices.FindAsync(id);
            if (entity == null) return false;

            _context.SeasonalPrices.Remove(entity);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
