using HotelReservation.Api.Data;
using HotelReservation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly AppDbContext _context;

        public NotificationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Notification>> GetByUserId(int userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCount(int userId)
        {
            return await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task<Notification?> GetById(int id)
        {
            return await _context.Notifications.FindAsync(id);
        }

        public async Task Add(Notification notification)
        {
            _context.Notifications.Add(notification);
            await Task.CompletedTask;
        }

        public async Task Delete(Notification notification)
        {
            _context.Notifications.Remove(notification);
            await Task.CompletedTask;
        }

        public async Task DeleteAll(int userId)
        {
            var notes = await _context.Notifications.Where(n => n.UserId == userId).ToListAsync();
            _context.Notifications.RemoveRange(notes);
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<List<Notification>> GetUnreadByUserId(int userId)
        {
             return await _context.Notifications
                 .Where(n => n.UserId == userId && !n.IsRead)
                 .ToListAsync();
        }
    }
}
