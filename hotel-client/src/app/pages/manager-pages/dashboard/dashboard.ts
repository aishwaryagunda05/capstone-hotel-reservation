import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../../../core/services/manager-service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class ManagerDashboard implements OnInit {
  assignedHotelId: number | null = null;
  hotelCount: number = 0;

  constructor(
    private router: Router,
    private managerService: ManagerService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.managerService.getAssignedHotels().subscribe(hotels => {
      this.hotelCount = hotels ? hotels.length : 0;
      if (hotels && hotels.length > 0) {
        this.assignedHotelId = hotels[0].hotelId;
      }
    });
  }

  goToPending() {
    this.router.navigate(['/manager/pending']);
  }

  goToRooms() {
    this.router.navigate(['/manager/rooms']);
  }

  goToReports() {
    if (this.assignedHotelId) {
      this.router.navigate(['/manager/reports', this.assignedHotelId]);
    } else {
      this.snackBar.open('No hotel assigned to this manager.', 'Close', { duration: 3000 });
    }
  }

  goToReservations() {
    if (this.assignedHotelId) {
      this.router.navigate(['/manager/reservations-list', this.assignedHotelId]);
    } else {
      this.snackBar.open('No hotel assigned to this manager.', 'Close', { duration: 3000 });
    }
  }
}
