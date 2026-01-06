using HotelReservation.Api.Models;

namespace HotelReservation.Api.Repositories
{
    public interface IRoomTypeRepository
    {
        Task<IEnumerable<RoomType>> GetAllAsync();
        Task<RoomType?> GetByIdAsync(int id);
        Task AddAsync(RoomType entity);
        Task UpdateAsync(RoomType entity);
        Task DeleteAsync(RoomType entity);
    }
}
