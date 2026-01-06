using HotelReservation.Api.Data;
using HotelReservation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Repositories
{
    public class ServiceRequestRepository : IServiceRequestRepository
    {
        private readonly AppDbContext _context;

        public ServiceRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task Add(ServiceRequest request)
        {
            _context.ServiceRequests.Add(request);
            await Task.CompletedTask;
        }

        public async Task<List<ServiceRequest>> GetByUserId(int userId)
        {
            return await _context.ServiceRequests
                .Include(sr => sr.Reservation)
                    .ThenInclude(r => r.Hotel)
                .Include(sr => sr.Reservation)
                    .ThenInclude(r => r.ReservationRooms)
                        .ThenInclude(rr => rr.Room)
                .Include(sr => sr.Room)
                .Where(sr => sr.Reservation.UserId == userId)
                .OrderByDescending(sr => sr.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<ServiceRequest>> GetByHotelId(int hotelId)
        {
            return await _context.ServiceRequests
                .Include(sr => sr.Reservation)
                .ThenInclude(r => r.ReservationRooms)
                .ThenInclude(rr => rr.Room)
                .Include(sr => sr.Room)
                .Where(sr => sr.Reservation.HotelId == hotelId)
                .OrderByDescending(sr => sr.CreatedAt)
                .ToListAsync();
        }

        public async Task<ServiceRequest?> GetById(int id)
        {
            return await _context.ServiceRequests
                .Include(r => r.Reservation)
                .FirstOrDefaultAsync(r => r.RequestId == id);
        }
        
        public async Task<List<ServiceRequest>> GetServedByReservationId(int reservationId)
        {
            return await _context.ServiceRequests
                 .Where(sr => sr.ReservationId == reservationId && sr.Status == "Served")
                 .ToListAsync();
        }

        public async Task DeleteByReservationId(int reservationId)
        {
            var requests = await _context.ServiceRequests.Where(sr => sr.ReservationId == reservationId).ToListAsync();
            _context.ServiceRequests.RemoveRange(requests);
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }
    }
}
