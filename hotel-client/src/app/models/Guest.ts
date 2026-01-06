export interface Hotel {
  hotelId: number;
  hotelName: string;
  city: string;
  address: string;
}

export interface RoomBreakdown {
  from: string;
  to: string;
  rate: number;
  type: string;
}

export interface AvailableRoom {
  roomId: number;
  roomNumber: string;
  roomType: string;
  maxGuests: number;
  pricePerNight: number;
  totalPrice: number;
  breakdown: RoomBreakdown[];
}