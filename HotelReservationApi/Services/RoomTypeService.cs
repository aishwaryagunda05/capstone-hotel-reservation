using HotelReservation.Api.DTOs;
using HotelReservation.Api.Models;
using HotelReservation.Api.Repositories;

namespace HotelReservation.Api.Services
{
    public class RoomTypeService
    {
        private readonly IRoomTypeRepository _repo;

        public RoomTypeService(IRoomTypeRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<RoomTypeDto>> GetAllAsync()
        {
            var list = await _repo.GetAllAsync();
            return list.Select(x => new RoomTypeDto
            {
                RoomTypeId = x.RoomTypeId,
                RoomTypeName = x.RoomTypeName,
                Description = x.Description,
                BasePrice = x.BasePrice,
                MaxGuests = x.MaxGuests,
                HotelId = x.HotelId,
                Amenities = x.Amenities,
                Features = x.Features
            });
        }

        public async Task<RoomTypeDto?> GetAsync(int id)
        {
            var x = await _repo.GetByIdAsync(id);
            if (x == null) return null;

            return new RoomTypeDto
            {
                RoomTypeId = x.RoomTypeId,
                RoomTypeName = x.RoomTypeName,
                Description = x.Description,
                BasePrice = x.BasePrice,
                MaxGuests = x.MaxGuests,
                HotelId = x.HotelId,
                Amenities = x.Amenities,
                Features = x.Features
            };
        }

        public async Task CreateAsync(RoomTypeDto dto)
        {
            var entity = new RoomType
            {
                RoomTypeName = dto.RoomTypeName,
                Description = dto.Description,
                BasePrice = dto.BasePrice,
                MaxGuests = dto.MaxGuests,
                HotelId = dto.HotelId,
                Amenities = dto.Amenities,
                Features = dto.Features
            };

            await _repo.AddAsync(entity);
        }

        public async Task UpdateAsync(int id, RoomTypeDto dto)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) throw new Exception("RoomType not found");

            entity.RoomTypeName = dto.RoomTypeName;
            entity.Description = dto.Description;
            entity.BasePrice = dto.BasePrice;
            entity.MaxGuests = dto.MaxGuests;
            entity.HotelId = dto.HotelId;
            entity.Amenities = dto.Amenities;
            entity.Features = dto.Features;

            await _repo.UpdateAsync(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) throw new Exception("RoomType not found");

            await _repo.DeleteAsync(entity);
        }
    }
}
