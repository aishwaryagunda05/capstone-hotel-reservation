using HotelReservation.Api.DTOs;
using HotelReservation.Api.Models;
using HotelReservation.Api.Repositories;

namespace HotelReservation.Api.Services
{
    public class RoomService
    {
        private readonly IRoomRepository _repo;

        public RoomService(IRoomRepository repo, UserHotelAssignmentRepository assignmentRepo)
        {
            _repo = repo;
            _assignmentRepo = assignmentRepo;
        }

        public async Task<IEnumerable<RoomDto>> GetAllAsync()
        {
            var list = await _repo.GetAllAsync();

            return list.Select(r => new RoomDto
            {
                RoomId = r.RoomId,
                HotelId = r.HotelId,
                RoomTypeId = r.RoomTypeId,
                RoomNumber = r.RoomNumber,
                Status = r.Status,
                IsActive = r.IsActive,
                Price = r.Price
            });
        }

        public async Task CreateAsync(RoomDto dto)
        {
            var existingRooms = await _repo.GetByHotelIdAsync(dto.HotelId);
            if (existingRooms.Any(r => r.RoomNumber == dto.RoomNumber))
            {
                throw new Exception($"Room number {dto.RoomNumber} already exists in this hotel.");
            }

            var entity = new Room
            {
                HotelId = dto.HotelId,
                RoomTypeId = dto.RoomTypeId,
                RoomNumber = dto.RoomNumber,
                Price = dto.Price,
                Status = dto.Status ?? "Available",
                IsActive = (dto.Status != "Unavailable")
            };

            await _repo.AddAsync(entity);
        }

        public async Task UpdateAsync(int id, RoomDto dto)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) throw new Exception("Room not found");

            entity.HotelId = dto.HotelId;
            entity.RoomTypeId = dto.RoomTypeId;
            entity.RoomNumber = dto.RoomNumber;
            entity.Status = dto.Status;
            entity.IsActive = (dto.Status != "Unavailable");
            entity.Price = dto.Price;

            await _repo.UpdateAsync(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) throw new Exception("Room not found");

            await _repo.DeleteAsync(entity);
        }

        private readonly UserHotelAssignmentRepository _assignmentRepo;

        public async Task<IEnumerable<RoomDto>> GetRoomsByManagerIdAsync(int managerId)
        {
            var assignments = await _assignmentRepo.GetAllByUserIdAsync(managerId);
            if (!assignments.Any()) return Enumerable.Empty<RoomDto>();

            var hotelIds = assignments.Select(a => a.HotelId).Distinct().ToList();

            var allRooms = new List<Room>();
            foreach (var hId in hotelIds)
            {
                var rooms = await _repo.GetByHotelIdAsync(hId);
                allRooms.AddRange(rooms);
            }

            return allRooms.Select(r => new RoomDto
            {
                RoomId = r.RoomId,
                HotelId = r.HotelId,
                RoomTypeId = r.RoomTypeId,
                RoomNumber = r.RoomNumber,
                Status = r.Status,
                IsActive = r.IsActive,
                Price = r.Price
            });
        }

        public async Task CreateForManagerAsync(int managerId, RoomDto dto)
        {
            await ValidateManagerAccess(managerId, dto.HotelId);
            await CreateAsync(dto);
        }

        public async Task UpdateForManagerAsync(int managerId, int roomId, RoomDto dto)
        {
            var existingRoom = await _repo.GetByIdAsync(roomId);
            if (existingRoom == null) throw new Exception("Room not found");
        
            await ValidateManagerAccess(managerId, existingRoom.HotelId);
       
            if (dto.HotelId != existingRoom.HotelId)
            {
                 await ValidateManagerAccess(managerId, dto.HotelId);
            }

            await UpdateAsync(roomId, dto);
        }

        public async Task DeleteForManagerAsync(int managerId, int roomId)
        {
            var existingRoom = await _repo.GetByIdAsync(roomId);
            if (existingRoom == null) throw new Exception("Room not found");

            await ValidateManagerAccess(managerId, existingRoom.HotelId);
            await DeleteAsync(roomId);
        }

        public async Task<IEnumerable<RoomDto>> GetRoomsByManagerAndHotelIdAsync(int managerId, int hotelId)
        {
            await ValidateManagerAccess(managerId, hotelId);

            var rooms = await _repo.GetByHotelIdAsync(hotelId);

            return rooms.Select(r => new RoomDto
            {
                RoomId = r.RoomId,
                HotelId = r.HotelId,
                RoomTypeId = r.RoomTypeId,
                RoomNumber = r.RoomNumber,
                Status = r.Status,
                IsActive = r.IsActive,
                Price = r.Price
            });
        }

        private async Task ValidateManagerAccess(int managerId, int hotelId)
        {
            var assignment = await _assignmentRepo.GetExistingAsync(managerId, hotelId);
            if (assignment == null)
                throw new UnauthorizedAccessException("Manager is not assigned to this hotel.");
        }
    }
}
