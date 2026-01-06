using Microsoft.EntityFrameworkCore;
using HotelReservation.Api.Data;
using HotelReservation.Api.Models;

namespace HotelReservation.Api.Repositories
{
    public class RoomRepository : IRoomRepository
    {
        private readonly AppDbContext _context;

        public RoomRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Room>> GetAllAsync()
            => await _context.Rooms.ToListAsync();

        public async Task<IEnumerable<Room>> GetByHotelIdAsync(int hotelId)
            => await _context.Rooms.Where(r => r.HotelId == hotelId).ToListAsync();

        public async Task<Room?> GetByIdAsync(int id)
            => await _context.Rooms.FindAsync(id);

        public async Task AddAsync(Room entity)
        {
            _context.Rooms.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Room entity)
        {
            _context.Rooms.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Room entity)
        {
            _context.Rooms.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
