using HotelReservation.Api.Repositories;
using HotelReservation.Api.Models;
using HotelReservation.Api.Controllers; 
using HotelReservation.Api.DTOs;


namespace HotelReservation.Api.Services
{
    public class BillingService
    {
        private readonly IInvoiceRepository _repo;
        private readonly ReservationRepository _reservationRepo;
        private readonly ServiceRequestService _serviceRequestService;

        public BillingService(
            IInvoiceRepository repo, 
            ReservationRepository reservationRepo,
            ServiceRequestService serviceRequestService)
        {
            _repo = repo;
            _reservationRepo = reservationRepo;
            _serviceRequestService = serviceRequestService;
        }

        public async Task<InvoicePreviewDto?> GetInvoicePreview(int reservationId)
        {
            var reservation = await _reservationRepo.GetByIdWithDetails(reservationId);
            if (reservation == null) return null;

            var serviceRequests = await _serviceRequestService.GetServedRequestsForReservation(reservationId);
            decimal serviceTotal = serviceRequests.Sum(sr => sr.Price);
            var nights = reservation.CheckOutDate.DayNumber - reservation.CheckInDate.DayNumber;
            if (nights < 1) nights = 1;

            decimal roomTotal = 0;
            var roomDetails = new List<object>();

            foreach (var rr in reservation.ReservationRooms)
            {
                var itemTotal = rr.PricePerNight * nights;
                roomTotal += itemTotal;

                roomDetails.Add(new
                {
                    RoomNumber = rr.Room?.RoomNumber ?? "N/A",
                    RoomType = rr.Room?.RoomType?.RoomTypeName ?? "Standard",
                    PricePerNight = rr.PricePerNight,
                    Nights = nights,
                    Total = itemTotal
                });
            }

            var breakage = reservation.BreakageFee ?? 0;
            var subTotal = roomTotal + breakage + serviceTotal;
            var taxRate = 0.05m;
            var taxAmount = subTotal * taxRate;
            var grandTotal = subTotal + taxAmount;

            var invoice = await _repo.GetByReservationId(reservationId);

            return new InvoicePreviewDto
            {
                ReservationId = reservation.ReservationId,
                GuestName = reservation.GuestName,
                CheckIn = reservation.CheckInDate,
                CheckOut = reservation.CheckOutDate,
                Rooms = roomDetails,
                RoomTotal = roomTotal,
                BreakageFee = breakage,
                ServiceCharges = serviceTotal,
                ServiceDetails = serviceRequests.Select(s => new { s.RequestType, s.Price }).ToList<object>(),
                SubTotal = subTotal,
                TaxAmount = taxAmount,
                GrandTotal = grandTotal,
                ExistingInvoiceId = invoice?.InvoiceId,
                PaymentStatus = invoice?.PaymentStatus ?? "Pending"
            };
        }

        public async Task<InvoiceResponseDto> ProcessPayment(PaymentRequestDto request)
        {
            var reservation = await _reservationRepo.GetById(request.ReservationId);
            if (reservation == null) throw new Exception("Reservation not found");
            var nights = reservation.CheckOutDate.DayNumber - reservation.CheckInDate.DayNumber;
            if (nights < 1) nights = 1;
            reservation = await _reservationRepo.GetByIdWithDetails(request.ReservationId);
             
            var serviceRequests = await _serviceRequestService.GetServedRequestsForReservation(request.ReservationId);
            decimal serviceTotal = serviceRequests.Sum(sr => sr.Price);

            decimal roomTotal = reservation.ReservationRooms.Sum(x => x.PricePerNight * nights);
            decimal breakage = reservation.BreakageFee ?? 0;
            decimal subTotal = roomTotal + breakage + serviceTotal;
            decimal tax = subTotal * 0.05m;
            decimal grandTotal = subTotal + tax;

            var invoice = await _repo.GetByReservationId(request.ReservationId);
                if (invoice == null)
            {
                invoice = new Invoice
                {
                    ReservationId = request.ReservationId,
                    InvoiceDate = DateTime.UtcNow,
                    SubTotal = subTotal,
                    TaxAmount = tax,
                    GrandTotal = grandTotal,
                    PaymentStatus = "Pending"
                };
                await _repo.AddInvoice(invoice);
            }
            else
            {
                invoice.SubTotal = subTotal;
                invoice.TaxAmount = tax;
                invoice.GrandTotal = grandTotal;
            }
            
            await _repo.Save(); 

            var payment = new Payment
            {
                InvoiceId = invoice.InvoiceId,
                PaymentDate = DateTime.UtcNow,
                AmountPaid = request.Amount,
                PaymentMode = request.PaymentMode,
                TransactionRef = request.TransactionRef ?? Guid.NewGuid().ToString()
            };

            if (request.Amount >= invoice.GrandTotal - 0.1m)
            {
                invoice.PaymentStatus = "Paid";
            }

            await _repo.AddPayment(payment);
            await _repo.Save();

            return new InvoiceResponseDto
            {
                Success = true,
                InvoiceId = invoice.InvoiceId,
                Message = "Payment Successful"
            };
        }

        public async Task<List<InvoiceDto>> GetInvoicesByGuest(int userId)
        {
            var invoices = await _repo.GetByUserId(userId);
            return invoices.Select(i => new InvoiceDto
            {
                InvoiceId = i.InvoiceId,
                ReservationId = i.ReservationId,
                InvoiceDate = i.InvoiceDate,
                GrandTotal = i.GrandTotal,
                PaymentStatus = i.PaymentStatus,
                HotelName = i.Reservation.Hotel.HotelName,
                RoomNumbers = i.Reservation.ReservationRooms.Select(rr => rr.Room.RoomNumber).ToList()
            }).ToList();
        }

        public class InvoicePreviewDto
        {
            public int ReservationId { get; set; }
            public string GuestName { get; set; }
            public DateOnly CheckIn { get; set; }
            public DateOnly CheckOut { get; set; }
            public List<object> Rooms { get; set; }
            public decimal RoomTotal { get; set; }
            public decimal BreakageFee { get; set; }
            public decimal ServiceCharges { get; set; }
            public List<object> ServiceDetails { get; set; }
            public decimal SubTotal { get; set; }
            public decimal TaxAmount { get; set; }
            public decimal GrandTotal { get; set; }
            public int? ExistingInvoiceId { get; set; }
            public string PaymentStatus { get; set; }
        }

        public class InvoiceResponseDto
        {
            public bool Success { get; set; }
            public int InvoiceId { get; set; }
            public string Message { get; set; }
        }

        public class InvoiceDto
        {
            public int InvoiceId { get; set; }
            public int ReservationId { get; set; }
            public DateTime InvoiceDate { get; set; }
            public decimal GrandTotal { get; set; }
            public string PaymentStatus { get; set; }
            public string HotelName { get; set; }
            public List<string> RoomNumbers { get; set; }
        }
    }
}
