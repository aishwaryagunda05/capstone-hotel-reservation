import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-guest-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './guest-layout.html',
    styleUrls: ['./guest-layout.css']
})
export class GuestLayoutComponent implements OnInit {
    isCollapsed = false;
    showNotifications = false;
    notifications: any[] = [];
    unreadCount = 0;
    private notificationTimer: any;

    constructor(
        private auth: AuthService,
        private router: Router,
        private notificationService: NotificationService
    ) {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            this.isCollapsed = true;
        }
    }

    ngOnInit() {
        // Initial check
        this.notificationService.checkForNewNotifications();

        // Subscribe to notifications list
        this.notificationService.notifications$.subscribe(notes => {
            this.notifications = notes;
        });

        // Subscribe to unread count
        this.notificationService.unreadCount$.subscribe(count => {
            this.unreadCount = count;
        });

        // Polling for notifications every 30 seconds
        setInterval(() => {
            this.notificationService.checkForNewNotifications();
        }, 30000);
    }

    toggleNotifications() {
        this.showNotifications = !this.showNotifications;
        if (this.showNotifications) {
            this.notificationService.fetchNotifications();

            if (this.notificationTimer) {
                clearTimeout(this.notificationTimer);
            }

            // Logic: All notifications should go off after 30s after icon is clicked
            this.notificationTimer = setTimeout(() => {
                this.notificationService.deleteAllNotifications().subscribe();
            }, 30000);
        }
    }

    openNotification(n: any) {
        if (!n.isRead) {
            this.notificationService.markAsRead(n.notificationId).subscribe();
        }
        // Individual timer removed as per new request for bulk removal after icon click
    }

    isBookingActive(): boolean {
        const url = this.router.url;
        return url.includes('/guest/search') ||
            url.includes('/guest/hotels') ||
            url.includes('/guest/rooms') ||
            url.includes('/guest/confirm');
    }

    toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/login']);
    }
}
