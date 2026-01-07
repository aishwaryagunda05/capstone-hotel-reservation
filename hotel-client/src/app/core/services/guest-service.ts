import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, timeout } from 'rxjs/operators';
import { Hotel } from '../../models/Hotel';
import { AvailableRoom } from '../../models/Guest';

export interface ReservationResponse {
  reservationId: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class GuestService {

  private base = 'http://localhost:5254/api';

  constructor(private http: HttpClient) { }

  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.base}/hotels`).pipe(
      timeout(5000), 
      tap({
        next: (data) => console.log('GuestService: Received hotels', data),
        error: (err) => console.error('GuestService: Error fetching hotels', err)
      })
    );
  }

  searchRooms(data: any): Observable<AvailableRoom[]> {
    return this.http.post<AvailableRoom[]>
      (`${this.base}/reservations/search`, data);
  }

  book(dto: any): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>
      (`${this.base}/reservations`, dto);
  }

  getMyReservations(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/reservations/guest/${userId}`);
  }

  cancelReservation(id: number, reason: string): Observable<any> {
    return this.http.post(`${this.base}/reservations/${id}/cancel`, { reason });
  }
}
