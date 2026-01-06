using Microsoft.EntityFrameworkCore;
using HotelReservation.Api.Data;
using HotelReservation.Api.Models;

namespace HotelReservation.Api.Repositories
{
    public class RoomTypeRepository : IRoomTypeRepository
    {
        private readonly AppDbContext _context;

        public RoomTypeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RoomType>> GetAllAsync()
            => await _context.RoomTypes.ToListAsync();

        public async Task<RoomType?> GetByIdAsync(int id)
            => await _context.RoomTypes.FindAsync(id);

        public async Task AddAsync(RoomType entity)
        {
            _context.RoomTypes.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(RoomType entity)
        {
            _context.RoomTypes.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(RoomType entity)
        {
            _context.RoomTypes.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
