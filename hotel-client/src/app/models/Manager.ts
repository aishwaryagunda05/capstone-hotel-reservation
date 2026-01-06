export interface AssignedHotel {
  hotelId: number;
  hotelName: string;
  city?: string;
  address?: string;
}

export interface RoomInfo {
  roomId: number;
  roomNumber: string;
  roomType: string;
  maxGuests: number;
  isActive: boolean;
}

export interface RoomDto {
  roomId: number;
  hotelId: number;
  roomTypeId: number;
  roomNumber: string;
  status: string;
  price?: number;
  isActive: boolean;
}

export interface PendingReservation {
  reservationId: number;
  guest: string;
  email: string;
  hotel: string;
  checkIn: string;
  checkOut: string;
  status: string;
  rooms: {
    roomNumber: string;
    pricePerNight: number;
    totalAmount?: number;
  }[];
}
