import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, catchError, of } from 'rxjs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { AdminService } from '../../../core/services/admin-service';
import { User } from '../../../models/User';
import { Hotel } from '../../../models/Hotel';
import { UserHotelAssignment } from '../../../models/UserHotelAssignment';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-assign-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, MatSnackBarModule, MatTableModule, MatSortModule],
  templateUrl: './user-hotel-assignments.html',
  styleUrls: ['./user-hotel-assignments.css']
})
export class UserHotelAssignmentsComponent implements OnInit, AfterViewInit {

  allUsers: User[] = [];
  assignableUsers: User[] = [];
  hotels: Hotel[] = [];
  allAssignments: UserHotelAssignment[] = [];

  dataSource = new MatTableDataSource<UserHotelAssignment>([]);
  displayedColumns: string[] = ['user', 'role', 'hotel', 'status', 'actions'];

  selectedUserId: number | null = null;
  selectedHotelId: number | null = null;

  loading = true;
  errorMsg: string | null = null;

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    if (p) {
      this.dataSource.paginator = p;
    }
  }

  @ViewChild(MatSort) set sort(s: MatSort) {
    if (s) {
      this.dataSource.sort = s;
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'user': return this.getUserEmail(item.userId);
          case 'role': return this.getUserRole(item.userId);
          case 'hotel': return this.getHotelName(item.hotelId);
          case 'status': return item.isActive ? 'Active' : 'Suspended';
          default: return (item as any)[property];
        }
      };
    }
  }

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'user': return this.getUserEmail(item.userId);
        case 'role': return this.getUserRole(item.userId);
        case 'hotel': return this.getHotelName(item.hotelId);
        case 'status': return item.isActive ? 'Active' : 'Suspended';
        default: return (item as any)[property];
      }
    };
  }

  ngAfterViewInit() {
  }

  loadData() {
    this.loading = true;
    this.errorMsg = null;
    this.cd.detectChanges();

    forkJoin({
      users: this.adminService.getAssignableUsers().pipe(catchError(() => of([]))),
      hotels: this.adminService.getHotels().pipe(catchError(() => of([]))),
      assignments: this.adminService.getAssignments().pipe(catchError(() => of(null)))
    }).subscribe({
      next: (res: any) => {
        this.allUsers = res.users || [];
        this.assignableUsers = this.allUsers.filter(u => {
          const role = u.role?.toLowerCase() || '';
          return role === 'manager' || role === 'receptionist';
        });

        this.hotels = res.hotels || [];

        const rawList = res.assignments || [];
        this.allAssignments = rawList.map((a: any) => ({
          userHotelAssignmentId: a.userHotelAssignmentId || a.UserHotelAssignmentId,
          userId: a.userId || a.UserId,
          hotelId: a.hotelId || a.HotelId,
          isActive: a.isActive !== undefined ? a.isActive : a.IsActive
        }));

        this.dataSource.data = this.allAssignments;
        this.dataSource.data = this.allAssignments;

        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMsg = "We encountered a technical issue loading the dashboard.";
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: UserHotelAssignment, filter: string) => {
      const email = this.getUserEmail(data.userId).toLowerCase();
      const hotel = this.getHotelName(data.hotelId).toLowerCase();
      const role = this.getUserRole(data.userId).toLowerCase();
      return email.includes(filter) || hotel.includes(filter) || role.includes(filter);
    };

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  assignUser() {
    if (!this.selectedUserId || !this.selectedHotelId) return;

    this.loading = true;
    const dto = {
      userHotelAssignmentId: 0,
      userId: Number(this.selectedUserId),
      hotelId: Number(this.selectedHotelId),
      isActive: true
    };

    this.adminService.assignUserToHotel(dto).subscribe({
      next: () => {
        this.snackBar.open('User assigned successfully', 'Close', { duration: 3000 });
        this.loadData();
        this.selectedUserId = null;
        this.selectedHotelId = null;
      },
      error: () => {
        this.snackBar.open("Operation failed.", 'Close', { duration: 5000 });
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  toggle(a: UserHotelAssignment) {
    this.adminService.updateAssignmentStatus(a.userHotelAssignmentId!, !a.isActive)
      .subscribe(() => this.loadData());
  }

  delete(a: UserHotelAssignment) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Remove Assignment',
        message: 'Permanent Action: Remove this staff member from this hotel?',
        confirmText: 'Remove'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteAssignment(a.userHotelAssignmentId!)
          .subscribe({
            next: () => {
              this.snackBar.open('Assignment removed', 'Close', { duration: 3000 });
              this.loadData();
            },
            error: () => this.snackBar.open('Failed to remove assignment', 'Close', { duration: 5000 })
          });
      }
    });
  }

  getUserEmail(id: number) {
    const userId = Number(id);
    const user = this.allUsers.find(u => Number(u.userId) === userId);
    return user?.email || `Staff ID: ${userId}`;
  }

  getHotelName(id: number) {
    const hotelId = Number(id);
    const hotel = this.hotels.find(h => Number(h.hotelId) === hotelId);
    return hotel?.hotelName || `Hotel ID: ${hotelId}`;
  }

  getUserRole(id: number) {
    const userId = Number(id);
    const user = this.allUsers.find(u => Number(u.userId) === userId);
    return user?.role || 'Staff';
  }
}
