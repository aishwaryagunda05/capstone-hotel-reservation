import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RoomType } from '../../../models/RoomType';
import { AdminService } from '../../../core/services/admin-service';
import { MaterialModule } from '../../../material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  standalone: true,
  selector: 'app-roomtypes',
  templateUrl: './roomtypes.html',
  styleUrls: ['./roomtypes.css'],
  imports: [CommonModule, RouterModule, MaterialModule]
})

export class RoomTypesComponent implements OnInit {

  hotelGroups: { hotelId: number, hotelName: string, roomTypes: RoomType[] }[] = [];
  allGroups: { hotelId: number, hotelName: string, roomTypes: RoomType[] }[] = []; // for filtering
  loading = true;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    Promise.all([
      this.adminService.getHotels().toPromise(),
      this.adminService.getRoomTypes().toPromise()
    ]).then(([hotels, rt]) => {

      const groups: { hotelId: number, hotelName: string, roomTypes: RoomType[] }[] = [];
      const unassigned: RoomType[] = [];

      (rt || []).forEach(r => {
        if (r.hotelId) {
          const hotel = hotels?.find(h => h.hotelId === r.hotelId);
          if (!hotel) return;
          let group = groups.find(g => g.hotelId === r.hotelId);
          if (!group) {
            group = {
              hotelId: r.hotelId,
              hotelName: hotel.hotelName,
              roomTypes: []
            };
            groups.push(group);
          }
          group.roomTypes.push(r);
        } else {
          unassigned.push(r);
        }
      });

      if (unassigned.length > 0) {
        groups.push({ hotelId: 0, hotelName: 'Unassigned', roomTypes: unassigned });
      }
      groups.sort((a, b) => a.hotelName.localeCompare(b.hotelName));

      this.allGroups = JSON.parse(JSON.stringify(groups));
      this.hotelGroups = groups;
      this.loading = false;
      this.cd.detectChanges();
    }).catch(err => {
      console.error(err);
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (!value) {
      this.hotelGroups = JSON.parse(JSON.stringify(this.allGroups));
    } else {
      this.hotelGroups = this.allGroups.map(g => ({
        ...g,
        roomTypes: g.roomTypes.filter(r => r.roomTypeName.toLowerCase().includes(value) ||
          (r.description?.toLowerCase() || '').includes(value))
      })).filter(g => g.roomTypes.length > 0 || g.hotelName.toLowerCase().includes(value));
    }
  }

  add() {
    this.router.navigate(['/admin/roomtypes/add']);
  }

  edit(id: number) {
    this.router.navigate(['/admin/roomtypes/edit', id]);
  }

  delete(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Room Type',
        message: 'Are you sure you want to delete this room type?',
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteRoomType(id).subscribe({
          next: () => {
            this.snackBar.open('Room type deleted successfully', 'Close', { duration: 3000 });
            this.loadData();
          },
          error: (err) => {
            console.error('Delete failed', err);
            this.snackBar.open('Failed to delete room type. It may be in use.', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }
}
