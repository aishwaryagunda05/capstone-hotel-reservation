import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../material.module';
import { AdminService } from '../../../core/services/admin-service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

import { Room } from '../../../models/Room';
import { RoomType } from '../../../models/RoomType';
import { Hotel } from '../../../models/Hotel';

interface RoomVM {
  roomId: number;
  roomNumber: string;
  status: string;
  hotelName: string;
  roomType: string;
  price: number;
  hotelId: number;
}

@Component({
  standalone: true,
  templateUrl: './rooms.html',
  styleUrls: ['./rooms.css'],
  imports: [CommonModule, MaterialModule, MatPaginatorModule, MatSnackBarModule]
})
export class RoomsComponent implements OnInit {

  // Data source removed, using list
  allRooms: RoomVM[] = [];
  filteredRooms: RoomVM[] = [];
  pagedRooms: RoomVM[] = [];
  hotels: Hotel[] = [];
  selectedHotel: Hotel | null = null;
  loading = true;
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    Promise.all([
      this.adminService.getHotels().toPromise(),
      this.adminService.getRoomTypes().toPromise(),
      this.adminService.getRooms().toPromise()
    ]).then(([hotels, roomTypes, rooms]) => {
      this.hotels = hotels || [];
      const hotelMap = new Map<number, string>();
      if (hotels) hotels.forEach(h => hotelMap.set(h.hotelId!, h.hotelName));

      const typeMap = new Map<number, RoomType>();
      if (roomTypes) roomTypes.forEach(t => typeMap.set(t.roomTypeId!, t));

      this.allRooms = (rooms || []).map(r => ({
        roomId: r.roomId!,
        roomNumber: r.roomNumber,
        status: r.status ?? 'Available',
        hotelName: hotelMap.get(r.hotelId) ?? 'Unknown',
        roomType: typeMap.get(r.roomTypeId)?.roomTypeName ?? '',
        price: typeMap.get(r.roomTypeId)?.basePrice ?? 0,
        hotelId: r.hotelId
      } as RoomVM));

      // Check query params for auto-selection (Arjun Fix context)
      const hotelIdParam = this.route.snapshot.queryParamMap.get('hotelId');
      if (hotelIdParam) {
        const preSelected = this.hotels.find(h => h.hotelId === +hotelIdParam);
        if (preSelected) {
          this.selectedHotel = preSelected;
          this.filterRoomsByHotel();
        }
      } else if (this.selectedHotel) {
        this.filterRoomsByHotel();
      } else {
        this.filteredRooms = [];
      }

      this.loading = false;
      this.cd.detectChanges();
    }).catch(err => {
      console.error("Error loading room data", err);
      this.loading = false;
      this.snackBar.open('Failed to load rooms', 'Close', { duration: 3000 });
      this.cd.detectChanges();
    });
  }

  selectHotel(h: Hotel) {
    this.selectedHotel = h;
    this.filterRoomsByHotel();
  }

  clearSelection() {
    this.selectedHotel = null;
    this.filteredRooms = [];
    this.pagedRooms = [];
  }

  filterRoomsByHotel() {
    if (!this.selectedHotel) return;
    this.filteredRooms = this.allRooms.filter(r => r.hotelId === this.selectedHotel!.hotelId);
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();
    this.updatePage();
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  updatePage() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedRooms = this.filteredRooms.slice(start, end);
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    const base = this.allRooms.filter(r => r.hotelId === this.selectedHotel?.hotelId);

    if (!value) {
      this.filteredRooms = base;
    } else {
      this.filteredRooms = base.filter(r =>
        r.roomNumber.toLowerCase().includes(value) ||
        r.roomType.toLowerCase().includes(value)
      );
    }
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();
    this.updatePage();
  }

  add() {
    this.router.navigate(['/admin/rooms/add']);
  }

  edit(id: number) {
    this.router.navigate(['/admin/rooms/edit', id]);
  }

  delete(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Room',
        message: 'Are you sure you want to delete this room? This action cannot be undone.',
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteRoom(id).subscribe({
          next: () => {
            this.snackBar.open('Room deleted successfully', 'Close', { duration: 3000 });
            this.loadData();
          },
          error: (err) => {
            console.error('Delete failed', err);
            this.snackBar.open('Failed to delete room', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
