import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-guest-confirm',
  imports: [CommonModule],
  templateUrl: './guest-confirm.html',
  styleUrl: './guest-confirm.css',
})
export class GuestConfirmComponent {

  data = history.state;

  constructor(private router: Router, private location: Location) {
    if (!this.data || !this.data.reservationId) {
    }
  }

  goBack() {
    this.location.back();
  }

  goToBookings() {
    this.router.navigate(['/guest/reservations']);
  }
}
