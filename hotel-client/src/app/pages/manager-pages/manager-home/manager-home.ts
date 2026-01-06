import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../../../core/services/manager-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manager-home',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './manager-home.html',
  styleUrls: ['./manager-home.css']
})
export class ManagerHomeComponent implements OnInit {

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
    if (this.hotelCount > 0) {
      this.router.navigate(['/manager/reports', 0]);
    } else {
      this.snackBar.open('No hotel assigned to this manager.', 'Close', { duration: 3000 });
    }
  }

  goToReservations() {
    if (this.hotelCount > 0) {
      this.router.navigate(['/manager/reservations-list', 0]);
    } else {
      this.snackBar.open('No hotel assigned to this manager.', 'Close', { duration: 3000 });
    }
  }
}
