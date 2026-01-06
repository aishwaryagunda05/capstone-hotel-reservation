export interface Room {
  roomId?: number;
  hotelId: number;
  hotelName?: string;
  roomTypeId: number;
  roomTypeName?: string;
  roomNumber: string;
  status?: string;
  isActive?: boolean;
}
