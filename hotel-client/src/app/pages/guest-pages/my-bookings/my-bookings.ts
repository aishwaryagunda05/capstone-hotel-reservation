import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../../core/services/guest-service';
import { AuthService } from '../../../core/services/auth-service';
import { ToastService } from '../../../core/services/toast-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-bookings.html',
  styleUrls: ['./my-bookings.css']
})
export class MyBookingsComponent implements OnInit {

  bookings: any[] = [];
  loading = true;

  constructor(
    private guest: GuestService,
    private auth: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    const userId = this.auth.userId;
    console.log('MyBookings: Current UserID:', userId);

    if (userId > 0) {
      this.load(userId);
    } else {
      console.warn('Invalid UserID, cannot load bookings');
      this.loading = false;
    }
  }

  load(userId: number) {
    this.guest.getMyReservations(userId).subscribe({
      next: (res) => {
        console.log('Bookings loaded:', res);
        this.bookings = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.loading = false;
      }
    });
  }

  cancel(id: number) {
    const reason = prompt('Please enter a reason for cancellation:');
    if (reason === null) return; // Users cancelled the prompt
    if (!reason.trim()) {
      this.toastService.show('Cancellation reason is required.', 'error');
      return;
    }

    this.guest.cancelReservation(id, reason).subscribe({
      next: () => {
        this.toastService.show('Reservation cancelled successfully.', 'success');
        this.load(this.auth.userId);
      },
      error: (err) => {
        this.toastService.show('Failed to cancel: ' + (err.error?.message || 'Unknown error'), 'error');
      }
    });
  }
}
