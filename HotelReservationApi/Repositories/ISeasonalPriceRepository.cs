public interface ISeasonalPriceRepository
{
    Task<IEnumerable<SeasonalPrice>> GetAllAsync();
    Task<SeasonalPrice?> GetByIdAsync(int id);
    Task AddAsync(SeasonalPrice entity);
    Task UpdateAsync(SeasonalPrice entity);
    Task DeleteAsync(SeasonalPrice entity);

    Task<bool> ExistsOverlappingAsync(
        int hotelId,
        int roomTypeId,
        DateOnly start,
        DateOnly end,
        int? excludeId = null);
}
