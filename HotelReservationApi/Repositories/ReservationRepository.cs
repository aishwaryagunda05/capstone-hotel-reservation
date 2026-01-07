using HotelReservation.Api.Models;
using HotelReservation.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Repositories
{
    public class ReservationRepository
    {
        private readonly AppDbContext _context;

        public ReservationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Room>> GetAvailableRooms(
            int hotelId, DateOnly checkIn, DateOnly checkOut, int guests)
        { 
            var occupiedRoomIds = await _context.Reservations
                .Where(r => r.HotelId == hotelId && r.Status != "Cancelled" && r.Status != "Rejected")
                .Where(r => checkIn < r.CheckOutDate && checkOut > r.CheckInDate)
                .SelectMany(r => r.ReservationRooms.Select(rr => rr.RoomId))
                .Distinct()
                .ToListAsync();
            return await _context.Rooms
                .Include(r => r.RoomType)
                .Where(r => r.HotelId == hotelId && r.Status == "Available" && r.IsActive)
                .Where(r => !occupiedRoomIds.Contains(r.RoomId))
                .ToListAsync();
        }

        public async Task<decimal> GetSeasonalPrice(int hotelId, int roomTypeId, DateOnly date)
        {
            var seasonal = await _context.SeasonalPrices
                .Where(s => s.HotelId == hotelId && s.RoomTypeId == roomTypeId)
                .Where(s => date >= s.StartDate && date <= s.EndDate)
                .FirstOrDefaultAsync();

            return seasonal?.PricePerNight ?? 0;
        }

        public async Task AddReservation(Reservation res)
        {
            _context.Reservations.Add(res);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Reservation>> GetByGuest(int userId)
            => await _context.Reservations
                .Include(r => r.Hotel)
                .Include(r => r.ReservationRooms)
                    .ThenInclude(rr => rr.Room)
                        .ThenInclude(r => r.RoomType)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedDate)
                .ToListAsync();

        public async Task<List<Reservation>> GetAll()
            => await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Hotel)
                .Include(r => r.ReservationRooms)
                    .ThenInclude(rr => rr.Room)
                        .ThenInclude(r => r.RoomType)
                .OrderByDescending(r => r.CreatedDate)
                .ToListAsync();

        public async Task<Reservation?> GetById(int id)
            => await _context.Reservations.FindAsync(id);

        public async Task<Reservation?> GetByIdWithDetails(int id)
            => await _context.Reservations
                .Include(r => r.Hotel)
                .Include(r => r.User)
                .Include(r => r.ReservationRooms)
                    .ThenInclude(rr => rr.Room)
                        .ThenInclude(r => r.RoomType)
                .FirstOrDefaultAsync(r => r.ReservationId == id);

        public async Task<List<Reservation>> GetByHotel(int hotelId)
            => await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Hotel)
                .Include(r => r.ReservationRooms)
                    .ThenInclude(rr => rr.Room)
                        .ThenInclude(r => r.RoomType)
                .Where(r => r.HotelId == hotelId)
                .OrderByDescending(r => r.CreatedDate)
                .ToListAsync();

        public async Task Save() => await _context.SaveChangesAsync();

        public async Task<User?> GetUserByEmail(string email)
            => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        public async Task<User?> GetUser(int userId)
            => await _context.Users.FindAsync(userId);
    }
}
