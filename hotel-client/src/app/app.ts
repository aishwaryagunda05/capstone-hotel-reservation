import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { ToastComponent } from './shared/components/toast/toast';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.html'
})
export class App {
  router = inject(Router);
  loadingService = inject(LoadingService); // ⭐ Inject Service
  showNavbar = true;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide navbar explicitly for receptionist dashboard
      this.showNavbar = !event.url.includes('/reception/reservations');
    });
  }
}
