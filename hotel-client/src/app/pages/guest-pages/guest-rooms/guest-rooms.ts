import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, ViewChild } from '@angular/core';
import { GuestService } from '../../../core/services/guest-service';
import { Router } from '@angular/router';
import { AvailableRoom } from '../../../models/Guest';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast-service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-guest-rooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './guest-rooms.html',
  styleUrl: './guest-rooms.css',
})
export class GuestRoomsComponent implements OnInit {

  data: any;
  rooms: AvailableRoom[] = [];
  displayedColumns: string[] = ['select', 'roomNumber', 'roomType', 'maxGuests', 'pricePerNight', 'totalPrice'];

  // Filter/Sort/Pagination
  filteredRooms: AvailableRoom[] = [];
  pagedRooms: AvailableRoom[] = [];
  searchText: string = '';
  sortBy: string = 'price_asc';
  selectedRoomType: string = 'All';
  uniqueRoomTypes: string[] = ['All'];

  // Pagination
  pageSize = 6;
  pageIndex = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  selected: number[] = []; // room IDs
  loading = true;
  totalPrice = 0;

  constructor(
    private guest: GuestService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private toastService: ToastService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.data = history.state;
    }
  }

  ngOnInit() {
    if (!this.data || !this.data.hotelId) {
      if (isPlatformBrowser(this.platformId)) {
        // Redirect if no data
        console.warn('No hotel data provided');
      }
      this.loading = false;
      return;
    }

    this.loading = true;

    this.guest.searchRooms({
      hotelId: this.data.hotelId,
      checkInDate: this.data.checkIn,
      checkOutDate: this.data.checkOut,
      guests: this.data.guests
    }).subscribe({
      next: (res) => {
        this.rooms = res || [];
        this.extractRoomTypes();
        this.applyFilter(); // Initial filter
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading rooms:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  extractRoomTypes() {
    const types = new Set(this.rooms.map(r => r.roomType));
    this.uniqueRoomTypes = ['All', ...Array.from(types)];
  }

  applyFilter() {
    let temp = [...this.rooms];

    // 1. Text Search
    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      temp = temp.filter(r =>
        r.roomNumber.toString().includes(term) ||
        r.roomType.toLowerCase().includes(term)
      );
    }

    // 2. Room Type Filter
    if (this.selectedRoomType !== 'All') {
      temp = temp.filter(r => r.roomType === this.selectedRoomType);
    }

    // 3. Sort
    if (this.sortBy === 'price_asc') {
      temp.sort((a, b) => a.totalPrice - b.totalPrice);
    } else if (this.sortBy === 'price_desc') {
      temp.sort((a, b) => b.totalPrice - a.totalPrice);
    }

    this.filteredRooms = temp;
    this.pageIndex = 0; // Reset to first page on filter change
    if (this.paginator) this.paginator.firstPage();

    this.updatePage();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  updatePage() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedRooms = this.filteredRooms.slice(start, end);
  }

  toggle(id: number, price: number) {
    if (this.selected.includes(id)) {
      this.selected = this.selected.filter(x => x !== id);
      this.totalPrice -= price;
    } else {
      this.selected.push(id);
      this.totalPrice += price;
    }
  }

  // Helper to check selection for UI
  isSelected(id: number): boolean {
    return this.selected.includes(id);
  }

  book() {
    if (this.selected.length === 0) return;

    // Client-side Capacity Validation
    const selectedRooms = this.rooms.filter(r => this.selected.includes(r.roomId));
    const totalCapacity = selectedRooms.reduce((sum, r) => sum + r.maxGuests, 0);

    if (totalCapacity < this.data.guests) {
      this.toastService.show(
        `Insufficient capacity! Selected rooms fit ${totalCapacity} guests, but you have ${this.data.guests}.`,
        'error'
      );
      return;
    }

    const payload = {
      hotelId: this.data.hotelId,
      checkInDate: this.data.checkIn,
      checkOutDate: this.data.checkOut,
      roomIds: this.selected,
      guests: this.data.guests
    };

    this.loading = true;

    this.guest.book(payload).subscribe({
      next: (res) => {
        this.router.navigate(['/guest/confirm'], {
          state: {
            ...this.data,
            rooms: this.selected,
            selectedRoomDetails: selectedRooms,
            totalAmount: this.totalPrice,
            reservationId: res.reservationId
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        const msg = err.error?.message || "Booking failed — please try again.";
        this.toastService.show(msg, 'error');
      }
    });
  }

  processBreakdown(breakdown: any[]): any[] {
    if (!breakdown || breakdown.length === 0) return [];

    // Logic to simplify rate display (group consecutive days with same rate)
    const grouped = [];
    let currentGroup: any = null;

    for (const b of breakdown) {
      const date = new Date(b.from);
      if (!currentGroup) {
        currentGroup = { start: date, end: date, rate: b.rate };
      } else if (currentGroup.rate === b.rate) {
        currentGroup.end = date;
      } else {
        grouped.push(currentGroup);
        currentGroup = { start: date, end: date, rate: b.rate };
      }
    }
    if (currentGroup) grouped.push(currentGroup);
    return grouped;
  }

  goBack() {
    this.location.back();
  }
}
