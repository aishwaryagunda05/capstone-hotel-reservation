import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent {
  isOpen = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isOpen = false;
    });
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}
