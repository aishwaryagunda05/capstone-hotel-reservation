using HotelReservation.Api.Models;

namespace HotelReservation.Api.Repositories
{
    public interface IInvoiceRepository
    {
        Task<Invoice?> GetByReservationId(int reservationId);
        Task<List<Invoice>> GetByUserId(int userId);
        Task AddInvoice(Invoice invoice);
        Task AddPayment(Payment payment);
        Task Save();
    }
}
