using HotelReservation.Api.Models;

namespace HotelReservation.Api.Repositories
{
    public interface INotificationRepository
    {
        Task<List<Notification>> GetByUserId(int userId);
        Task<int> GetUnreadCount(int userId);
        Task<Notification?> GetById(int id);
        Task Add(Notification notification);
        Task Delete(Notification notification);
        Task DeleteAll(int userId);
        Task Save();
        Task<List<Notification>> GetUnreadByUserId(int userId);
    }
}
