import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { NotificationService } from '../../core/services/notification.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {

  showProfile = false;
  showNotifications = false; 
  isLogged = false;
  isMobileMenuOpen = false;
  unreadNotifications$: Observable<any[]>;
  constructor(
    public auth: AuthService,
    private router: Router,
    public notificationService: NotificationService
  ) {
    this.unreadNotifications$ = this.notificationService.notifications$.pipe(
      map(notes => notes.filter(n => !n.isRead))
    );
    this.router.events.subscribe(() => {
      this.isMobileMenuOpen = false;
      this.showProfile = false;
      this.showNotifications = false;
    });
    this.auth.authState$.subscribe(state => {
      this.isLogged = state;
      this.showProfile = false;
      this.showNotifications = false;
    });
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
    if (this.showProfile) this.showNotifications = false; 
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showProfile = false; 
      this.notificationService.fetchNotifications();
      setTimeout(() => {
        if (this.showNotifications) {
          this.notificationService.markAllAsRead().subscribe();
        }
      }, 12000); 
    }
  }

  editProfile() {
    this.showProfile = false;
    this.router.navigate(['/profile']);
  }

  logout() {
    this.showProfile = false;
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
