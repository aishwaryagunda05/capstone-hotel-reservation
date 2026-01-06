using HotelReservation.Api.Models;

namespace HotelReservation.Api.Repositories
{
    public interface IRoomRepository
    {
        Task<IEnumerable<Room>> GetAllAsync();
        Task<IEnumerable<Room>> GetByHotelIdAsync(int hotelId);
        Task<Room?> GetByIdAsync(int id);
        Task AddAsync(Room entity);
        Task UpdateAsync(Room entity);
        Task DeleteAsync(Room entity);
    }
}
