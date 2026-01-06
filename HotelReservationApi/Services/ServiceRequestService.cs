using HotelReservation.Api.Repositories;
using HotelReservation.Api.Models;
using HotelReservation.Api.DTOs;

namespace HotelReservation.Api.Services
{
    public class ServiceRequestService
    {
        private readonly IServiceRequestRepository _repo;
        private readonly ReservationRepository _reservationRepo;
        
        public ServiceRequestService(IServiceRequestRepository repo, ReservationRepository reservationRepo)
        {
            _repo = repo;
            _reservationRepo = reservationRepo;
        }

        public async Task<int?> CreateRequest(int userId, CreateServiceRequestDto dto)
        {
            
            var guestReservations = await _reservationRepo.GetByGuest(userId);
            var activeReservation = guestReservations
                .FirstOrDefault(r => r.Status == "CheckedIn");

            if (activeReservation == null) return null;

            var request = new ServiceRequest
            {
                ReservationId = activeReservation.ReservationId,
                RoomId = dto.RoomId,
                RequestType = dto.RequestType,
                Description = dto.Description,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            if (dto.RoomId.HasValue)
            {
                bool roomInReservation = activeReservation.ReservationRooms.Any(rr => rr.RoomId == dto.RoomId.Value);
                if (!roomInReservation)
                {
                     if (!roomInReservation) request.RoomId = null;
                }
            }

            await _repo.Add(request);
            await _repo.Save();

            return request.RequestId;
        }

        public Task<List<ServiceRequest>> GetUserRequests(int userId)
            => _repo.GetByUserId(userId);

        public Task<List<ServiceRequest>> GetHotelRequests(int hotelId)
            => _repo.GetByHotelId(hotelId);

        public async Task<ServiceRequest?> MarkAsServed(int requestId, decimal price)
        {
            var request = await _repo.GetById(requestId);
            if (request == null) return null;

            request.Status = "Served";
            request.Price = price;

            await _repo.Save();
            return request;
        }
        
        public Task<List<ServiceRequest>> GetServedRequestsForReservation(int reservationId)
            => _repo.GetServedByReservationId(reservationId);

        public async Task DeleteRequestsForReservation(int reservationId)
        {
            await _repo.DeleteByReservationId(reservationId);
            await _repo.Save();
        }
    }
}
