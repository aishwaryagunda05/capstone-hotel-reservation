public interface ISeasonalPriceService
{
    Task<IEnumerable<SeasonalPriceDto>> GetAllAsync();
    Task<SeasonalPriceDto?> GetByIdAsync(int id);
    Task<SeasonalPriceDto> CreateAsync(SeasonalPriceDto dto);
    Task UpdateAsync(int id, SeasonalPriceDto dto);
    Task DeleteAsync(int id);
}
