import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs'; // Fix: Observable import added
import { tap } from 'rxjs/operators';

export interface Notification {
    notificationId: number;
    userId: number;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = 'http://localhost:5254/api/notifications';
    private unreadCountSubject = new BehaviorSubject<number>(0);
    unreadCount$ = this.unreadCountSubject.asObservable();

    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    notifications$ = this.notificationsSubject.asObservable();

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {

        if (isPlatformBrowser(this.platformId)) {
            this.getUnreadCount();
            this.fetchNotifications();
        }
    }

    getNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(this.apiUrl).pipe(
            tap(notes => this.notificationsSubject.next(notes))
        );
    }

    fetchNotifications() {
        this.getNotifications().subscribe();
    }

    getUnreadCount() {
        this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).subscribe(res => {
            this.unreadCountSubject.next(res.count);
        });
    }

    markAsRead(id: number) {
        return this.http.put(`${this.apiUrl}/${id}/read`, {}).pipe(
            tap(() => {
                this.getUnreadCount();
                this.fetchNotifications();
            })
        );
    }

    markAllAsRead() {
        return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
            tap(() => {
                this.getUnreadCount();
                this.fetchNotifications();
            })
        );
    }

    deleteNotification(id: number) {
        return this.http.delete(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                this.getUnreadCount();
                this.fetchNotifications();
            })
        );
    }

    deleteAllNotifications() {
        return this.http.delete(`${this.apiUrl}/all`).pipe(
            tap(() => {
                this.getUnreadCount();
                this.fetchNotifications();
            })
        );
    }

    checkForNewNotifications() {
        this.getNotifications().subscribe(notifications => {
            const unread = notifications.filter(n => !n.isRead);
        });
    }

    public showToast(message: string, type: string = 'Info') {
        let panelClass = 'toast-info';
        if (type === 'Success') panelClass = 'toast-success';
        if (type === 'Warning') panelClass = 'toast-warning';
        if (type === 'Error') panelClass = 'toast-danger';

        this.snackBar.open(message, 'OK', {
            duration: 5000,
            panelClass: [panelClass]
        });
    }
}
