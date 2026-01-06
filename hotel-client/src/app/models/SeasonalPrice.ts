export interface SeasonalPrice {
  seasonalPriceId: number;
  hotelId: number;
  roomTypeId: number;
  startDate: string;
  endDate: string;
  pricePerNight: number;
}
