using HotelReservation.Api.Models;

namespace HotelReservation.Api.Repositories
{
    public interface IHotelRepository
    {
        Task<IEnumerable<Hotel>> GetAllHotelsAsync();
        Task<Hotel?> GetHotelByIdAsync(int id);
        Task<Hotel> CreateHotelAsync(Hotel hotel);
        Task<Hotel?> UpdateHotelAsync(int id, Hotel hotel);
        Task<bool> DeleteHotelAsync(int id);
    }
}
