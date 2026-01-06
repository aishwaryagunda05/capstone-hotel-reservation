import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material.module';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { RoomDto } from '../../../../models/Manager';
import { ManagerService } from '../../../../core/services/manager-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-room-form',
    standalone: true,
    imports: [CommonModule, MaterialModule, FormsModule, MatDialogModule],
    templateUrl: './room-form.component.html',
    styleUrls: ['./room-form.component.css']
})
export class RoomFormComponent {

    room: RoomDto;
    roomTypes: any[] = [];
    isEdit = false;

    constructor(
        public dialogRef: MatDialogRef<RoomFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private managerService: ManagerService,
        private snackBar: MatSnackBar
    ) {
        this.roomTypes = data.roomTypes;
        if (data.room) {
            this.isEdit = true;
            this.room = { ...data.room }; // clone
        } else {
            this.room = {
                roomId: 0,
                hotelId: data.hotelId || 0, // 🔥 Use passed ID
                roomTypeId: this.roomTypes.length > 0 ? this.roomTypes[0].roomTypeId : 0,
                roomNumber: '',
                status: 'Available',
                price: this.roomTypes.length > 0 ? this.roomTypes[0].basePrice : 0,
                isActive: true
            };
        }
    }

    onRoomTypeChange(typeId: number) {
        const type = this.roomTypes.find(t => t.roomTypeId === typeId);
        if (type) {
            this.room.price = type.basePrice;
            // Optionally, we could choose NOT to overwrite if user has entered a custom price.
            // But usually changing room type implies resetting defaults.
        }
    }

    save() {
        if (!this.room.roomNumber || !this.room.roomTypeId) return;

        if (this.isEdit) {
            this.managerService.updateRoom(this.room.roomId, this.room).subscribe({
                next: () => {
                    this.snackBar.open('Room updated successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (err: any) => this.snackBar.open('Failed to update room', 'Close', { duration: 3000 })
            });
        } else {
            this.managerService.createRoom(this.room).subscribe({
                next: () => {
                    this.snackBar.open('Room created successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (err: any) => {
                    console.error('Create Room Error:', err);
                    let msg = err.error?.message || err.message || 'Unknown Error';
                    if (typeof err.error === 'string') msg = err.error; // Handle plain text response
                    this.snackBar.open('Failed to create room: ' + msg, 'Close', { duration: 5000 });
                }
            });
        }
    }


    close() {
        this.dialogRef.close(false);
    }
}
