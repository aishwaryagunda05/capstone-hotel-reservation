using HotelReservation.Api.Data;
using HotelReservation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Repositories
{
    public class ReservationApprovalRepository
    {
        private readonly AppDbContext _context;

        public ReservationApprovalRepository(AppDbContext context)
        {
            _context = context;
        }

        public Task<List<int>> GetAssignedHotelIds(int managerId)
        {
            return _context.UserHotelAssignments
                .Where(x => x.UserId == managerId && x.IsActive)
                .Select(x => x.HotelId)
                .ToListAsync();
        }

        public async Task<List<Reservation>> GetPendingReservationsForManager(int managerId)
        {
            var hotelIds = await GetAssignedHotelIds(managerId);

            return await _context.Reservations
                .Include(r => r.ReservationRooms).ThenInclude(rr => rr.Room)
                .Include(r => r.User)
                .Include(r => r.Hotel)
                .Where(r => hotelIds.Contains(r.HotelId) && (r.Status == "Booked" || r.Status == "Pending"))
                .OrderByDescending(r => r.CreatedDate)
                .ToListAsync();
        }

        public Task<Reservation?> GetById(int id)
        {
            return _context.Reservations
                .Include(r => r.ReservationRooms).ThenInclude(rr => rr.Room)
                .Include(r => r.User)
                .Include(r => r.Hotel)
                .FirstOrDefaultAsync(x => x.ReservationId == id);
        }

        public Task<bool> IsManagerAssigned(int userId, int hotelId)
        {
            return _context.UserHotelAssignments
                .AnyAsync(x => x.UserId == userId && x.HotelId == hotelId && x.IsActive);
        }

        public Task Save()
        {
            return _context.SaveChangesAsync();
        }
    }
}
