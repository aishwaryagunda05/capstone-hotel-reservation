import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ManagerService } from '../../../core/services/manager-service';
import { AuthService } from '../../../core/services/auth-service';

@Component({
    selector: 'app-manager-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './manager-layout.html',
    styleUrls: ['./manager-layout.css']
})
export class ManagerLayoutComponent implements OnInit {
    isOpen = false; // State for mobile sidebar
    assignedHotelId: number | null = null;
    currentUser: any = {};

    constructor(
        private managerService: ManagerService,
        public auth: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.fetchAssignedHotel();
        this.currentUser = { fullName: this.auth.name }; // Simple user info
    }

    fetchAssignedHotel() {
        this.managerService.getAssignedHotels().subscribe({
            next: (hotels) => {
                if (hotels && hotels.length > 0) {
                    if (hotels.length > 1) {
                        this.assignedHotelId = 0; // 0 indicates "All Assigned Hotels"
                    } else {
                        this.assignedHotelId = hotels[0].hotelId;
                    }
                }
            },
            error: () => console.error('Failed to fetch assigned hotel')
        });
    }

    toggleSidebar() {
        this.isOpen = !this.isOpen;
    }
}
