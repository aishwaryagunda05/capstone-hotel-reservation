using HotelReservation.Api.Data;
using HotelReservation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Repositories
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly AppDbContext _context;

        public InvoiceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Invoice?> GetByReservationId(int reservationId)
        {
            return await _context.Invoices.FirstOrDefaultAsync(i => i.ReservationId == reservationId);
        }

        public async Task<List<Invoice>> GetByUserId(int userId)
        {
            return await _context.Invoices
                .Include(i => i.Reservation)
                .ThenInclude(r => r.Hotel)
                .Include(i => i.Reservation)
                .ThenInclude(r => r.ReservationRooms)
                .ThenInclude(rr => rr.Room)
                .Where(i => i.Reservation.UserId == userId)
                .OrderByDescending(i => i.InvoiceDate)
                .ToListAsync();
        }

        public async Task AddInvoice(Invoice invoice)
        {
            _context.Invoices.Add(invoice);
            await Task.CompletedTask;
        }

        public async Task AddPayment(Payment payment)
        {
            _context.Payments.Add(payment);
            await Task.CompletedTask;
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }
    }
}
