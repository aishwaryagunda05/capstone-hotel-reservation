
using HotelReservation.Api.Repositories;

namespace HotelReservation.Api.Services
{
    public class SeasonalPriceService
    {
        private readonly SeasonalPriceRepository _repo;

        public SeasonalPriceService(SeasonalPriceRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<SeasonalPrice>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<SeasonalPrice?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task<SeasonalPrice> CreateAsync(SeasonalPriceDto dto)
        {
            var entity = new SeasonalPrice
            {
                HotelId = dto.HotelId,
                RoomTypeId = dto.RoomTypeId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                PricePerNight = dto.PricePerNight
            };

            await _repo.AddAsync(entity);
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repo.DeleteAsync(id);
        }
    }
}
