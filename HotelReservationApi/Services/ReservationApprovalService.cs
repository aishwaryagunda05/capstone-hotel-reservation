using HotelReservation.Api.Models;
using HotelReservation.Api.Repositories;

namespace HotelReservation.Api.Services
{
    public class ReservationApprovalService
    {
        private readonly ReservationApprovalRepository _repo;

        public ReservationApprovalService(ReservationApprovalRepository repo)
        {
            _repo = repo;
        }

        public Task<List<Reservation>> GetPendingReservationsForManager(int managerId)
        {
            return _repo.GetPendingReservationsForManager(managerId);
        }

        public async Task<string> Approve(int reservationId, int managerId)
        {
            var r = await _repo.GetById(reservationId);

            if (r == null) return "Reservation not found";

            var status = r.Status?.Trim();
            if (!string.Equals(status, "Booked", StringComparison.OrdinalIgnoreCase) && 
                !string.Equals(status, "Pending", StringComparison.OrdinalIgnoreCase))
                return $"Invalid Status: '{r.Status}'";

            if (!await _repo.IsManagerAssigned(managerId, r.HotelId))
                return $"Manager {managerId} not assigned to Hotel {r.HotelId}";

            r.Status = "Confirmed";
            await _repo.Save();
            return "Success";
        }

        public async Task<bool> Reject(int reservationId, int managerId)
        {
            var r = await _repo.GetById(reservationId);

            if (r == null || (!string.Equals(r.Status, "Booked", StringComparison.OrdinalIgnoreCase) && !string.Equals(r.Status, "Pending", StringComparison.OrdinalIgnoreCase)))
                return false;

            if (!await _repo.IsManagerAssigned(managerId, r.HotelId))
                return false;

            r.Status = "Rejected";
            await _repo.Save();
            return true;
        }
    }
}
