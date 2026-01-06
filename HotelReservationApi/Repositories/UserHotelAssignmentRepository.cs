using HotelReservation.Api.Data;
using HotelReservation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Repositories
{
    public class UserHotelAssignmentRepository
    {
        private readonly AppDbContext _context;

        public UserHotelAssignmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserHotelAssignment>> GetAllAsync()
        {
            return await _context
                .UserHotelAssignments
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<UserHotelAssignment>> GetAllByUserIdAsync(int userId)
        {
            return await _context.UserHotelAssignments
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .ToListAsync();
        }

        public async Task<UserHotelAssignment?> GetByIdAsync(int id)
        {
            return await _context
                .UserHotelAssignments
                .FirstOrDefaultAsync(x => x.UserHotelAssignmentId == id);
        }

        public async Task<UserHotelAssignment?> GetExistingAsync(int userId, int hotelId)
        {
            return await _context
                .UserHotelAssignments
                .FirstOrDefaultAsync(x => x.UserId == userId && x.HotelId == hotelId);
        }

        public async Task AddAsync(UserHotelAssignment entity)
        {
            _context.UserHotelAssignments.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(UserHotelAssignment entity)
        {
            _context.UserHotelAssignments.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
