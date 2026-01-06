import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest-search',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './guest-search.html',
  styleUrl: './guest-search.css',
})
export class GuestSearchComponent {

  hotel = history.state;

  checkIn: string = '';
  checkOut: string = '';
  guests = 1;

  error = '';

  constructor(private router: Router) {
    if (!this.hotel || !this.hotel.hotelId) {
      this.router.navigate(['/guest/hotels']);
    }

    if (this.hotel) {
      this.checkIn = this.hotel.checkIn || '';
      this.checkOut = this.hotel.checkOut || '';
      this.guests = this.hotel.guests || 1;
    }
  }

  search() {
    this.error = '';

    if (!this.checkIn || !this.checkOut) {
      this.error = 'Please select both Check-in and Check-out dates.';
      return;
    }

    const start = new Date(this.checkIn);
    const end = new Date(this.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      this.error = 'Check-in date cannot be in the past.';
      return;
    }

    if (end <= start) {
      this.error = 'Check-out date must be after Check-in date.';
      return;
    }

    // Backend likely expects proper Date format or string. 
    // Sending components.

    this.router.navigate(['/guest/rooms'], {
      state: {
        ...this.hotel, // Pass all hotel details (name, city, etc.)
        hotelId: this.hotel.hotelId,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        guests: this.guests
      }
    });
  }
}
