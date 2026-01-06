import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomServiceService } from '../../../core/services/room-service.service';
import { ToastService } from '../../../core/services/toast-service';
import { AuthService } from '../../../core/services/auth-service';
import { GuestService } from '../../../core/services/guest-service';

@Component({
    selector: 'app-guest-room-service',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './guest-room-service.html',
    styleUrls: ['./guest-room-service.css']
})
export class GuestRoomServiceComponent implements OnInit {

    requests: any[] = [];
    rooms: any[] = [];
    model = {
        requestType: 'Housekeeping',
        description: '',
        roomId: null as number | null
    };

    requestTypes = ['Housekeeping', 'Food & Beverage', 'Maintenance', 'Amenities', 'Other'];

    loading = false;

    constructor(
        private roomService: RoomServiceService,
        private toast: ToastService,
        private cdr: ChangeDetectorRef,
        private auth: AuthService,
        private guestService: GuestService
    ) { }

    ngOnInit() {
        this.auth.user$.subscribe(user => {
            if (user) {
                this.loadRequests();
                this.loadRooms(user.userId);
            }
        });
        if (this.auth.isLoggedIn) {
            this.loadRequests();
            const userId = this.auth.userId;
            if (userId) {
                this.loadRooms(userId);
            }
        }
    }

    loadRequests() {
        this.loading = true;
        this.roomService.getMyRequests().subscribe({
            next: (res) => {
                this.requests = res;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadRooms(userId: number) {
        this.guestService.getMyReservations(userId).subscribe({
            next: (res) => {
                const activeRes = res.filter(r => (r.status || '').toLowerCase() === 'checkedin');

                this.rooms = [];
                if (activeRes.length > 0) {
                    activeRes.forEach(r => {
                        if (r.rooms) {
                            this.rooms.push(...r.rooms);
                        }
                    });
                } else {
                    console.log('No active CheckedIn reservation found for user', userId);
                }
                if (this.rooms.length === 1) {
                    this.model.roomId = this.rooms[0].roomId;
                }
            },
            error: (err) => console.error('Failed to load rooms', err)
        });
    }

    submitRequest() {
        if (!this.model.description) {
            this.toast.show('Please provide a description.', 'error');
            return;
        }

        if (this.rooms.length > 1 && !this.model.roomId) {
            this.toast.show('Please select a room.', 'error');
            return;
        }

        if (this.rooms.length === 1 && !this.model.roomId) {
            this.model.roomId = this.rooms[0].roomId;
        }

        if (this.rooms.length > 0 && !this.model.roomId) {
            this.model.roomId = this.rooms[0].roomId;
        }

        const payload = {
            requestType: this.model.requestType,
            description: this.model.description,
            roomId: this.model.roomId || undefined
        };

        this.loading = true;
        this.roomService.createRequest(payload).subscribe({
            next: () => {
                this.toast.show('Request sent to reception!', 'success');
                this.model.description = ''; 
                this.loadRequests();
            },
            error: (err) => {
                this.loading = false;
                const msg = err.error?.message || 'Failed to send request.';
                this.toast.show(msg, 'error');
            }
        });
    }
}
