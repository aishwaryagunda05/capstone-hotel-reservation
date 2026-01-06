using HotelReservation.Api.Models;
using HotelReservation.Api.DTOs;
using HotelReservation.Api.Repositories;

namespace HotelReservation.Api.Services
{
    public class ReservationService
    {
        private readonly ReservationRepository _repo;

        public ReservationService(ReservationRepository repo)
        {
            _repo = repo;
        }

        public Task<User?> GetUserByEmail(string email)
            => _repo.GetUserByEmail(email);

        public async Task<List<AvailableRoomDto>> SearchRooms(RoomSearchRequestDto req)
        {   
            var rooms = await _repo.GetAvailableRooms(
                req.HotelId, req.CheckInDate, req.CheckOutDate, req.Guests);
 
            var nights = req.CheckOutDate.DayNumber - req.CheckInDate.DayNumber;
            if (nights <= 0) nights = 1;

            var list = new List<AvailableRoomDto>();

            foreach (var r in rooms)
            {
                decimal total = 0m;
                var dayPrices = new List<(DateOnly Day, decimal Rate)>();

                var day = req.CheckInDate;
                while (day < req.CheckOutDate)
                {
                    var seasonal = await _repo.GetSeasonalPrice(r.HotelId, r.RoomTypeId, day);
                    decimal rate = seasonal > 0 ? seasonal : r.RoomType.BasePrice;
                    total += rate;
                    dayPrices.Add((day, rate));
                    day = day.AddDays(1);
                }

                var breakdown = new List<PriceBreakdownDto>();
                int i = 0;

                while (i < dayPrices.Count)
                {
                    var start = dayPrices[i].Day;
                    var rate = dayPrices[i].Rate;
                    int j = i + 1;

                    while (j < dayPrices.Count && dayPrices[j].Rate == rate)
                        j++;

                    breakdown.Add(new PriceBreakdownDto
                    {
                        From = start, 
                        To = dayPrices[j - 1].Day.AddDays(1),
                        Rate = rate
                    });

                    i = j;
                }

                list.Add(new AvailableRoomDto
                {
                    RoomId = r.RoomId,
                    RoomNumber = r.RoomNumber,
                    RoomType = r.RoomType.RoomTypeName,
                    MaxGuests = r.RoomType.MaxGuests,
                    PricePerNight = Math.Round(total / nights, 2),
                    TotalPrice = Math.Round(total, 2),
                    Breakdown = breakdown
                });
            }

            return list;
        }

        public async Task<int> CreateReservation(int userId, CreateReservationDto dto)
        {
            var user = await _repo.GetUser(userId)
                ?? throw new Exception("User not found");
 
            var nights = dto.CheckOutDate.DayNumber - dto.CheckInDate.DayNumber;
            if (nights <= 0) nights = 1;

            var reservation = new Reservation
            {
                UserId = userId,


                HotelId = dto.HotelId,
                GuestName = user.FullName,
                GuestPhone = user.Phone,
                CheckInDate = dto.CheckInDate,
                CheckOutDate = dto.CheckOutDate,

                Status = "Booked",

                CreatedDate = DateTime.UtcNow
            };

            var availableRooms =
                await _repo.GetAvailableRooms(dto.HotelId, dto.CheckInDate, dto.CheckOutDate, 1);
            var selectedRooms = availableRooms.Where(r => dto.RoomIds.Contains(r.RoomId)).ToList();
            
            var unavailableRoomIds = dto.RoomIds.Except(selectedRooms.Select(r => r.RoomId)).ToList();
            if (unavailableRoomIds.Any())
            {
                throw new InvalidOperationException($"The following Room IDs are not available for the selected dates: {string.Join(", ", unavailableRoomIds)}. Please choose different rooms.");
            }

            var totalCapacity = selectedRooms.Sum(r => r.RoomType.MaxGuests);

            if (totalCapacity < dto.Guests)
            {
                throw new InvalidOperationException($"Selected rooms capacity ({totalCapacity}) is insufficient for {dto.Guests} guests.");
            }

            foreach (var roomId in dto.RoomIds)
            {
                var room = selectedRooms.First(x => x.RoomId == roomId);

                decimal total = 0m;
                var day = dto.CheckInDate;

                while (day < dto.CheckOutDate)
                {
                    var seasonal = await _repo.GetSeasonalPrice(dto.HotelId, room.RoomTypeId, day);
                    total += seasonal > 0 ? seasonal : room.RoomType.BasePrice;

                    day = day.AddDays(1);
                }

                reservation.ReservationRooms.Add(new ReservationRoom
                {
                    RoomId = roomId,
                    Nights = nights,
                    PricePerNight = Math.Round(total / nights, 2),
                    TotalAmount = Math.Round(total, 2)
                });
            }

            await _repo.AddReservation(reservation);
            return reservation.ReservationId;
        }

        public Task<List<Reservation>> GetReservationsByGuest(int userId)
            => _repo.GetByGuest(userId);

        public Task<List<Reservation>> GetAllReservations()
            => _repo.GetAll();

        public async Task<bool> CancelReservation(int reservationId, int userId)
        {
            var r = await _repo.GetById(reservationId);
            if (r == null || r.UserId != userId) return false;

            if (r.Status == "Cancelled" || r.Status == "Rejected") return false;

            r.Status = "Cancelled";
            await _repo.Save();
            return true;
        }

        public Task<List<Reservation>> GetReservationsByHotel(int hotelId)
            => _repo.GetByHotel(hotelId);

        public async Task<bool> ConfirmReservation(int reservationId)
        {
            var r = await _repo.GetById(reservationId);
            if (r == null) return false;
            if (!string.Equals(r.Status, "Booked", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(r.Status, "Pending", StringComparison.OrdinalIgnoreCase))
                return false;

            r.Status = "Confirmed";
            await _repo.Save();
            return true;
        }

        public async Task<bool> CheckInReservation(int reservationId)
        {
            var r = await _repo.GetById(reservationId);
            if (r == null) return false;
            var userReservations = await _repo.GetByGuest(r.UserId);
            if (userReservations.Any(res => string.Equals(res.Status, "CheckedIn", StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException("User already has an active checked-in reservation.");
            }

            if (!string.Equals(r.Status, "Confirmed", StringComparison.OrdinalIgnoreCase) && 
                !string.Equals(r.Status, "Pending", StringComparison.OrdinalIgnoreCase) && 
                !string.Equals(r.Status, "Booked", StringComparison.OrdinalIgnoreCase)) 
                return false;

            r.Status = "CheckedIn";
            await _repo.Save();
            return true;
        }

        public async Task<bool> CheckOutReservation(int reservationId, decimal breakageFee = 0)
        {
                                        
            var r = await _repo.GetById(reservationId);
            if (r == null) return false;
            if (!string.Equals(r.Status, "CheckedIn", StringComparison.OrdinalIgnoreCase)) 
                return false;

            r.Status = "CheckedOut";
            
            if (breakageFee > 0)
            {
                r.BreakageFee = breakageFee;
            }

            await _repo.Save();
            return true;
        }
        public Task<Reservation?> GetById(int id)
            => _repo.GetByIdWithDetails(id); 
    }
}
