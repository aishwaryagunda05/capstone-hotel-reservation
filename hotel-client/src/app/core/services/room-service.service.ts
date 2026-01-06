import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RoomServiceService {

    private baseUrl = 'http://localhost:5254/api/requests';

    constructor(private http: HttpClient) { }

    createRequest(data: { requestType: string, description: string, roomId?: number }): Observable<any> {
        return this.http.post(this.baseUrl, data);
    }

    getMyRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/my-requests`);
    }
}
