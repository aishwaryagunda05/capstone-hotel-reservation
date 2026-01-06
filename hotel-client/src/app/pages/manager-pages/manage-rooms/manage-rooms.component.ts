import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ManagerService } from '../../../core/services/manager-service';
import { RoomDto } from '../../../models/Manager';
import { MatDialog } from '@angular/material/dialog';
import { RoomFormComponent } from './room-form/room-form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-manage-rooms',
    standalone: true,
    imports: [CommonModule, MaterialModule, MatProgressSpinnerModule],
    templateUrl: './manage-rooms.component.html',
    styleUrls: ['./manage-rooms.component.css']
})
export class ManageRoomsComponent implements OnInit {

    dataSource = new MatTableDataSource<RoomDto>([]);
    allRooms: RoomDto[] = []; // Cache all rooms
    hotels: any[] = [];
    selectedHotelId: number | null = null;
    loadingMessage = 'Loading your hotel data...';

    roomTypes: any[] = [];
    displayedColumns: string[] = ['roomNumber', 'roomType', 'price', 'status', 'actions'];
    loading = true;

    constructor(
        private managerService: ManagerService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadData();
    }


    loadData() {
        console.log('ManageRoomsComponent: loadData starting');

        this.loading = true;
        this.loadingMessage = 'Loading your hotel data...';
        this.cdr.detectChanges();

        forkJoin({
            hotels: this.managerService.getAssignedHotels().pipe(catchError(err => {
                console.error('Failed to load hotels', err);
                this.snackBar.open('Could not load hotels', 'Dismiss', { duration: 5000 });
                return of([]);
            })),
            roomTypes: this.managerService.getRoomTypes().pipe(catchError(err => {
                console.error('Failed to load room types', err);
                // Non-critical, return empty
                return of([]);
            }))
        }).subscribe({
            next: (result) => {
                console.log('ManageRoomsComponent: Data fetched', result);
                this.hotels = result.hotels || [];
                this.roomTypes = result.roomTypes || [];

                console.log(`ManageRoomsComponent: Hotels count: ${this.hotels.length}`);

                if (this.hotels.length === 0) {
                    this.loading = false;
                    this.cdr.detectChanges();
                    return;
                }

                setTimeout(() => {
                    if (this.selectedHotelId) {
                        this.selectHotel(this.selectedHotelId);
                    } else {
                        this.cdr.detectChanges();
                    }
                }, 100);
            },
            error: (err) => {
                console.error('ManageRooms: Data load failed', err);
                this.loading = false;
                this.loadingMessage = 'Unexpected error occurred.';
                this.cdr.detectChanges();
            }
        });
    }

    selectHotel(hotelId: number) {
        console.log('ManageRoomsComponent: Selecting hotel', hotelId);
        this.selectedHotelId = hotelId;
        this.loading = true;
        this.loadingMessage = 'Loading rooms for ' + this.getSelectedHotelName() + '...';

        this.managerService.getRooms(hotelId).subscribe({
            next: (rooms) => {
                console.log('ManageRoomsComponent: Rooms fetched', rooms);
                this.allRooms = rooms;
                this.dataSource.data = rooms;
                this.loading = false;
            },
            error: (err) => {
                console.error('ManageRooms: GetRooms failed', err);
                this.dataSource.data = [];
                this.loading = false;
            }
        });
    }

    // goBackToHotels is already defined below but I'll make sure it's clean


    goBackToHotels() {
        this.selectedHotelId = null;
        this.dataSource.data = [];
    }

    getRoomTypeName(typeId: number): string {
        const type = this.roomTypes.find(t => t.roomTypeId === typeId);
        return type ? type.roomTypeName : 'Unknown';
    }

    getRoomPrice(typeId: number): number {
        const type = this.roomTypes.find(t => t.roomTypeId === typeId);
        return type ? type.basePrice : 0;
    }

    openAddDialog() {
        if (!this.selectedHotelId) return;

        const hotelRoomTypes = this.roomTypes.filter(rt => rt.hotelId === this.selectedHotelId);

        const dialogRef = this.dialog.open(RoomFormComponent, {
            width: '400px',
            data: { room: null, roomTypes: hotelRoomTypes, hotelId: this.selectedHotelId }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadData();
            }
        });
    }

    openEditDialog(room: RoomDto) {
        // Since a room belongs to a hotel, we should filter types for THAT hotel
        const hotelId = room.hotelId || this.selectedHotelId;
        const hotelRoomTypes = this.roomTypes.filter(rt => rt.hotelId === hotelId);

        const dialogRef = this.dialog.open(RoomFormComponent, {
            width: '400px',
            data: { room: room, roomTypes: hotelRoomTypes, hotelId: hotelId }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadData();
            }
        });
    }

    deleteRoom(id: number) {
        if (confirm('Are you sure you want to delete this room?')) {
            this.managerService.deleteRoom(id).subscribe({
                next: () => {
                    this.snackBar.open('Room deleted successfully', 'Close', { duration: 3000 });
                    this.loadData();
                },
                error: (err: any) => this.snackBar.open('Failed to delete room', 'Close', { duration: 3000 })
            });
        }
    }

    getSelectedHotelName(): string {
        const hotel = this.hotels.find(h => h.hotelId === this.selectedHotelId);
        return hotel ? hotel.hotelName : 'Selected Hotel';
    }
}
