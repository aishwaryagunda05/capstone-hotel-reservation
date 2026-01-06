import { Component, ChangeDetectorRef } from '@angular/core';
import { ManagerService } from '../../../core/services/manager-service';
import { NotificationService } from '../../../core/services/notification.service';
import { PendingReservation } from '../../../models/Manager';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-reservations.html',
  styleUrls: ['./pending-reservations.css']
})
export class PendingReservationsComponent {

  list: PendingReservation[] = [];
  loading = true;

  constructor(
    private manager: ManagerService,
    private cdr: ChangeDetectorRef,
    private notify: NotificationService
  ) {
    this.load();
  }

  load() {
    this.manager.getPendingReservations().subscribe({
      next: res => {
        // Backend returns all reservations for this manager.
        console.log('Pending Reservations:', res);
        this.list = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        if (err.status === 401) {
          console.error('Unauthorized! Server response:', err.error);
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  approve(id: number) {
    this.manager.approve(id).subscribe(() => {
      this.notify.showToast('Reservation confirmed successfully!', 'Success');
      this.load();
    });
  }

  reject(id: number) {
    this.manager.reject(id).subscribe(() => {
      this.notify.showToast('Reservation rejected.', 'Info');
      this.load();
    });
  }
}
