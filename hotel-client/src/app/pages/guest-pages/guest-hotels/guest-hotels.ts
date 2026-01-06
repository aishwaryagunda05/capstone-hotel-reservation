import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../../core/services/guest-service';
import { Hotel } from '../../../models/Hotel';

@Component({
  selector: 'app-guest-hotels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guest-hotels.html',
  styleUrls: ['./guest-hotels.css']
})
export class GuestHotelsComponent implements OnInit {

  hotels: Hotel[] = [];
  loading = true;
  error = '';

  constructor(
    private guest: GuestService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadHotels();
  }

  loadHotels() {
    this.loading = true;
    this.cdr.detectChanges(); 

    this.guest.getHotels().subscribe({
      next: (res) => {
        console.log('Hotels API Response:', res);
        this.hotels = res || []; 
        this.loading = false;
        this.cdr.detectChanges(); 
        console.log('Hotels assigned to view. Count:', this.hotels.length);
      },
      error: (err) => {
        console.error('Error loading hotels:', err);
        if (err.status === 401) {
          this.error = 'Unauthorized (401). Please login again.';
        } else if (err.status === 403) {
          this.error = 'Forbidden (403). Guests may not have permission to view all hotels. Check backend "HotelsController".';
        } else {
          this.error = `Failed to load hotels. Status: ${err.status} ${err.statusText}. Is the backend running on port 5254?`;
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  hotelImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  ];

  getImage(index: number): string {
    return this.hotelImages[index % this.hotelImages.length];
  }

  openHotel(h: Hotel) {
    this.router.navigate(['/guest/search'], { state: h });
  }
}
