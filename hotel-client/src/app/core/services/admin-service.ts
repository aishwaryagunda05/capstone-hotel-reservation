import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hotel } from '../../models/Hotel';
import { User } from '../../models/User';
import { RoomType } from '../../models/RoomType';
import { Room } from '../../models/Room';
import { SeasonalPrice } from '../../models/SeasonalPrice';
import { UserHotelAssignment } from '../../models/UserHotelAssignment';


@Injectable({ providedIn: 'root' })
export class AdminService {

  private baseUrl = 'http://localhost:5254/api/hotels';
  private userUrl = 'http://localhost:5254/api/admin/users';
  private roomTypesUrl = 'http://localhost:5254/api/admin/roomtypes';
  private roomsUrl = 'http://localhost:5254/api/admin/rooms';
  private seasonalPricesUrl = 'http://localhost:5254/api/admin/seasonalpricing';
  private assignmentsUrl = 'http://localhost:5254/api/admin/assignments';


  constructor(private http: HttpClient) { }

  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(this.baseUrl);
  }

  getHotel(id: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.baseUrl}/${id}`);
  }

  createHotel(model: Hotel): Observable<Hotel> {
    return this.http.post<Hotel>(this.baseUrl, model);
  }

  updateHotel(id: number, model: Hotel): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, model);
  }

  deleteHotel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.userUrl);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.userUrl}/${id}`);
  }

  createUser(model: User): Observable<User> {
    return this.http.post<User>(this.userUrl, model);
  }

  updateUser(id: number, model: User): Observable<void> {
    return this.http.put<void>(`${this.userUrl}/${id}`, model);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.userUrl}/${id}`);
  }
  getRoomTypes(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.roomTypesUrl);
  }

  getRoomType(id: number): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.roomTypesUrl}/${id}`);
  }

  createRoomType(model: RoomType): Observable<any> {
    return this.http.post(this.roomTypesUrl, model);
  }

  updateRoomType(id: number, model: RoomType): Observable<any> {
    return this.http.put(`${this.roomTypesUrl}/${id}`, model);
  }

  deleteRoomType(id: number): Observable<any> {
    return this.http.delete(`${this.roomTypesUrl}/${id}`);
  }
  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.roomsUrl);
  }

  getRoom(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.roomsUrl}/${id}`);
  }

  createRoom(model: Room): Observable<any> {
    return this.http.post(this.roomsUrl, model);
  }

  updateRoom(id: number, model: Room): Observable<any> {
    return this.http.put(`${this.roomsUrl}/${id}`, model);
  }

  deleteRoom(id: number): Observable<any> {
    return this.http.delete(`${this.roomsUrl}/${id}`);
  }
  // Seasonal Prices
  getSeasonalPrices(): Observable<SeasonalPrice[]> {
    return this.http.get<SeasonalPrice[]>(this.seasonalPricesUrl);
  }

  getSeasonalPrice(id: number): Observable<SeasonalPrice> {
    return this.http.get<SeasonalPrice>(`${this.seasonalPricesUrl}/${id}`);
  }

  createSeasonalPrice(model: SeasonalPrice): Observable<SeasonalPrice> {
    return this.http.post<SeasonalPrice>(this.seasonalPricesUrl, model);
  }

  updateSeasonalPrice(id: number, model: SeasonalPrice): Observable<void> {
    return this.http.put<void>(`${this.seasonalPricesUrl}/${id}`, model);
  }

  deleteSeasonalPrice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.seasonalPricesUrl}/${id}`);
  }
 
  getAssignableUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.userUrl);
  }

  getAssignments(): Observable<UserHotelAssignment[]> {
    return this.http.get<UserHotelAssignment[]>(this.assignmentsUrl);
  }

  assignUserToHotel(model: UserHotelAssignment): Observable<UserHotelAssignment> {
    return this.http.post<UserHotelAssignment>(this.assignmentsUrl, model);
  }

  updateAssignmentStatus(id: number, isActive: boolean): Observable<void> {
    return this.http.put<void>(`${this.assignmentsUrl}/${id}/status?isActive=${isActive}`, {});
  }
  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.assignmentsUrl}/${id}`);
  }




  // Reports
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`http://localhost:5254/api/admin/reports/stats`);
  }

  getRevenueTrend(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5254/api/admin/reports/revenue-trend`);
  }

  getReservationSummary(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5254/api/admin/reports/reservation-summary`);
  }

  getOccupancyReport(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5254/api/admin/reports/occupancy`);
  }
}