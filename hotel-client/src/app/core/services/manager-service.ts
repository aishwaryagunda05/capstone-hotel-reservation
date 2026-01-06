import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssignedHotel, RoomInfo, PendingReservation, RoomDto } from '../../models/Manager';

@Injectable({ providedIn: 'root' })
export class ManagerService {

  private api = 'http://localhost:5254/api/manager';

  constructor(private http: HttpClient) { }

  getAssignedHotels(): Observable<AssignedHotel[]> {
    return this.http.get<AssignedHotel[]>(`${this.api}/hotels`);
  }

  getPendingReservations(): Observable<PendingReservation[]> {
    return this.http.get<PendingReservation[]>(`${this.api}/reservations/pending`);
  }

  approve(reservationId: number): Observable<any> {
    return this.http.post(`${this.api}/reservations/${reservationId}/approve`, {});
  }

  reject(reservationId: number): Observable<any> {
    return this.http.post(`${this.api}/reservations/${reservationId}/reject`, {});
  }

  getRooms(hotelId?: number): Observable<RoomDto[]> {
    const url = hotelId ? `${this.api}/rooms/hotel/${hotelId}` : `${this.api}/rooms`;
    return this.http.get<RoomDto[]>(url);
  }

  createRoom(room: RoomDto): Observable<any> {
    return this.http.post(`${this.api}/rooms`, room);
  }

  updateRoom(id: number, room: RoomDto): Observable<any> {
    return this.http.put(`${this.api}/rooms/${id}`, room);
  }

  deleteRoom(id: number): Observable<any> {
    return this.http.delete(`${this.api}/rooms/${id}`);
  }

  getRoomTypes(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:5254/api/admin/roomtypes');
  }

  getManagerStats(hotelId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/reports/${hotelId}/stats`);
  }

  getManagerRevenueTrend(hotelId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/reports/${hotelId}/revenue-trend`);
  }

  getManagerReservationDistribution(hotelId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/reports/${hotelId}/reservation-distribution`);
  }

  getManagerReservations(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/reports/${hotelId}/reservations`);
  }

  getHotelBreakdown(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/reports/breakdown`);
  }
}
