using HotelReservation.Api.DTOs;
using HotelReservation.Api.Models;
using HotelReservation.Api.Data;
using HotelReservation.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Services
{
    public class UserHotelAssignmentService
    {
        private readonly UserHotelAssignmentRepository _repo;
        private readonly AppDbContext _context;

        public UserHotelAssignmentService(
            UserHotelAssignmentRepository repo,
            AppDbContext context)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<List<UserHotelAssignmentDto>> GetAllAsync()
        {
            var list = await _repo.GetAllAsync();

            return list.Select(x => new UserHotelAssignmentDto
            {
                UserHotelAssignmentId = x.UserHotelAssignmentId,
                UserId = x.UserId,
                HotelId = x.HotelId,
                IsActive = x.IsActive
            }).ToList();
        }

        public async Task<UserHotelAssignmentDto> AssignAsync(UserHotelAssignmentDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == dto.UserId);

            if (user == null)
                throw new Exception("User not found");

            if (user.Role != "Manager" && user.Role != "Receptionist")
                throw new Exception("Only Manager or Receptionist can be assigned to hotels");
            var hotelExists = await _context.Hotels.AnyAsync(h => h.HotelId == dto.HotelId);

            if (!hotelExists)
                throw new Exception("Hotel not found");
            var existing = await _repo.GetExistingAsync(dto.UserId, dto.HotelId);

            if (existing != null)
            {
                existing.IsActive = dto.IsActive;
                await _repo.SaveAsync();

                dto.UserHotelAssignmentId = existing.UserHotelAssignmentId;
                return dto;
            }

            var entity = new UserHotelAssignment
            {
                UserId = dto.UserId,
                HotelId = dto.HotelId,
                IsActive = dto.IsActive
            };

            await _repo.AddAsync(entity);

            dto.UserHotelAssignmentId = entity.UserHotelAssignmentId;

            return dto;
        }

        public async Task ToggleActiveAsync(int id, bool active)
        {
            var item = await _repo.GetByIdAsync(id);

            if (item == null)
                throw new Exception("Assignment not found");

            item.IsActive = active;
            await _repo.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repo.GetByIdAsync(id);

            if (entity == null)
                throw new Exception("Assignment not found");

            await _repo.DeleteAsync(entity);
        }

        public async Task<int?> GetHotelIdForUser(int userId)
        {
            var assignments = await _repo.GetAllByUserIdAsync(userId);
            return assignments.FirstOrDefault(x => x.IsActive)?.HotelId;
        }
    }
}
