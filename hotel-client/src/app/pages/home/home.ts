import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth-service';
import { GuestService } from '../../core/services/guest-service';
import { Router, RouterModule } from '@angular/router';
import { Hotel } from '../../models/Hotel';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  featuredHotels: Hotel[] = [];
  loading = true;
  error: any = null;

  constructor(
    public auth: AuthService,
    private guestService: GuestService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.guestService.getHotels().subscribe({
      next: (data) => {
        console.log('HomeComponent: Hotels loaded from API', data);
        this.featuredHotels = data || [];
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('HomeComponent: Failed to load hotels from API', err);
        this.error = 'Could not load hotel data. Please try again later.';
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  bookNow() {
    if (this.auth.isLoggedIn) {
      if (this.auth.role === 'Guest') {
        this.router.navigate(['/guest/search']);
      } else {
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/register']);
    }
  }
}
