import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-dashboard.html',
    styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent {
    menuItems = [
        {
            title: 'Hotels',
            icon: 'mdi:office-building-star-outline',
            link: '/admin/hotels',
            description: 'Manage hotel properties, locations, and details.'
        },
        {
            title: 'Users',
            icon: 'mdi:account-group-outline',
            link: '/admin/users',
            description: 'Manage system users, guests, and staff members.'
        },
        {
            title: 'Room Categories',
            icon: 'mdi:bed-king-outline',
            link: '/admin/roomtypes',
            description: 'Define various types of rooms and their base capacities.'
        },
        {
            title: 'Rooms',
            icon: 'mdi:door-sliding-lock',
            link: '/admin/rooms',
            description: 'Manage individual room units and their status.'
        },
        {
            title: 'Seasonal Prices',
            icon: 'mdi:calendar-clock-outline',
            link: '/admin/seasonal-prices',
            description: 'Set dynamic pricing based on seasons and dates.'
        },
        {
            title: 'Assign Users',
            icon: 'mdi:account-key-outline',
            link: '/admin/assignments',
            description: 'Assign receptionists and managers to specific hotels.'
        }
    ];
}
