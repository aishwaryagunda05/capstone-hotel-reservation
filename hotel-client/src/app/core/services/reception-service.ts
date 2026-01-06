import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReceptionService {

    baseUrl = 'http://localhost:5254/api/reservations/';

    constructor(private http: HttpClient) { }

    getAssignedHotelReservations(): Observable<any[]> {
        console.log('ReceptionService: Fetching from', `${this.baseUrl}receptionist/my-hotel`);
        return this.http.get<any[]>(`${this.baseUrl}receptionist/my-hotel`);
    }

    getReceptionBillings(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}receptionist/billings`);
    }

    checkInGuest(reservationId: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}${reservationId}/checkin`, {});
    }

    checkOutGuest(reservationId: number, breakageFee: number = 0): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}${reservationId}/checkout`, { breakageFee });
    }

    getAssignedHotelInfo(): Observable<{ hotelId: number }> {
        return this.http.get<{ hotelId: number }>(this.baseUrl + 'receptionist/info');
    }

    registerGuest(data: any): Observable<any> {
        return this.http.post('http://localhost:5254/api/auth/register/guest', data);
    }

    createWalkInReservation(data: any): Observable<any> {
        return this.http.post(this.baseUrl + 'walkin', data);
    }

    searchRooms(data: any): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'search', data);
    }

    getServiceRequests(hotelId: number): Observable<any[]> {
        return this.http.get<any[]>(`http://localhost:5254/api/requests/hotel/${hotelId}`);
    }

    serveRequest(requestId: number, price: number): Observable<any> {
        return this.http.post(`http://localhost:5254/api/requests/${requestId}/serve`, { price });
    }
}
