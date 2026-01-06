export interface RoomType {
  roomTypeId?: number;
  roomTypeName: string;
  description?: string;
  basePrice: number;
  maxGuests: number;
  hotelId?: number;
  amenities?: string;
  features?: string;
}
