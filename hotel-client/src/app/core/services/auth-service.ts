import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoginRequest, LoginResponse } from '../../models/Login';
import { RegisterRequest, RegisterResponse } from '../../models/Register';
import { ApiResponse } from '../../models/ApiResponse';
import { User } from '../../models/User';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {

  baseUrl = 'http://localhost:5254/api/';
  private isBrowser = false;

  private authState = new BehaviorSubject<boolean>(false);
  authState$ = this.authState.asObservable();

  private currentUser = new BehaviorSubject<{ userId: number, role: string, name: string } | null>(null);
  user$ = this.currentUser.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser && this.token) {
      if (this.isTokenValid(this.token)) {
        this.authState.next(true);
        this.updateCurrentUser();
      } else {
        this.logout(); 
      }
    }
  }

  private updateCurrentUser() {
    if (this.isBrowser && this.token) {
      this.currentUser.next({
        userId: this.userId,
        role: this.role || '',
        name: this.name || ''
      });
    } else {
      this.currentUser.next(null);
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch (e) {
      return false;
    }
  }

  login(model: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.baseUrl + 'auth/login', model);
  }

  register(model: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.baseUrl + 'auth/register', model);
  }

  createUser(model: any): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.baseUrl + 'admin/create-user', model);
  }

  saveUser(token: string, role: string, name: string): void {
    if (!this.isBrowser) return;

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('name', name);

    this.authState.next(true);   
    this.updateCurrentUser();
  }

  logout(): void {
    if (!this.isBrowser) return;

    localStorage.clear();
    this.authState.next(false); 
    this.updateCurrentUser();
  }

  get token(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  get role(): string | null {
    return this.isBrowser ? localStorage.getItem('role') : null;
  }

  get name(): string | null {
    return this.isBrowser ? localStorage.getItem('name') : null;
  }

  get userId(): number {
    const token = this.token;
    if (!token) return 0;
    try {
      const decoded: any = jwtDecode(token);
      const id = decoded.id || decoded.uid || decoded.userId || decoded.nameid;
      return id ? parseInt(id) : 0;
    } catch {
      return 0;
    }
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }


  getProfile(): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'auth/me');
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'auth/profile', data);
  }
}
