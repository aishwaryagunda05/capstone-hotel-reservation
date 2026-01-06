using HotelReservation.Api.Models;

namespace HotelReservation.Api.Repositories
{
    public interface IServiceRequestRepository
    {
        Task Add(ServiceRequest request);
        Task<List<ServiceRequest>> GetByUserId(int userId);
        Task<List<ServiceRequest>> GetByHotelId(int hotelId);
        Task<ServiceRequest?> GetById(int id);
        Task<List<ServiceRequest>> GetServedByReservationId(int reservationId);
        Task DeleteByReservationId(int reservationId);
        Task Save();
    }
}
