using HotelReservation.Api.Repositories;
using HotelReservation.Api.Models;

namespace HotelReservation.Api.Services
{
    public class NotificationService
    {
        private readonly INotificationRepository _repo;

        public NotificationService(INotificationRepository repo)
        {
            _repo = repo;
        }

        public Task<List<Notification>> GetUserNotifications(int userId)
            => _repo.GetByUserId(userId);

        public Task<int> GetUnreadCount(int userId)
            => _repo.GetUnreadCount(userId);

        public async Task MarkAsRead(int notificationId, int userId)
        {
            var notification = await _repo.GetById(notificationId);
            if (notification == null || notification.UserId != userId)
                return;

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _repo.Save();
            }
        }

        public async Task MarkAllAsRead(int userId)
        {
            var unread = await _repo.GetUnreadByUserId(userId);
            foreach (var n in unread)
            {
                n.IsRead = true;
            }
            if (unread.Any())
            {
                await _repo.Save();
            }
        }

        public async Task CreateNotification(int userId, string message, string type = "Info")
        {
            var note = new Notification
            {
                UserId = userId,
                Message = message,
                Type = type,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            await _repo.Add(note);
            await _repo.Save();
        }

        public async Task DeleteNotification(int notificationId, int userId)
        {
            var notification = await _repo.GetById(notificationId);
            if (notification != null && notification.UserId == userId)
            {
                await _repo.Delete(notification);
                await _repo.Save();
            }
        }

        public async Task DeleteAllNotifications(int userId)
        {
            await _repo.DeleteAll(userId);
            await _repo.Save();
        }
    }
}
