import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AdminService } from '../../../core/services/admin-service';
import { Hotel } from '../../../models/Hotel';
import { MaterialModule } from '../../../material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, MaterialModule, MatSnackBarModule],
  templateUrl: './hotels.html',
  styleUrls: ['./hotels.css']
})
export class HotelsComponent implements OnInit {
  allHotels: Hotel[] = [];
  pagedHotels: Hotel[] = [];
  loading = true;
  pageSize = 6;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadHotels();
  }
  loadHotels(): void {
    this.loading = true;
    this.adminService.getHotels().subscribe({
      next: (res) => {
        this.allHotels = res;
        this.filteredHotels = res; 
        this.updatePage();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading hotels', err);
        this.loading = false;
        this.snackBar.open('Failed to load hotels. Please try again.', 'Close', { duration: 3000 });
        this.cd.detectChanges();
      }
    });
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  updatePage() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedHotels = this.filteredHotels.slice(start, end); 
  }

  filteredHotels: Hotel[] = [];

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (!value) {
      this.filteredHotels = [...this.allHotels]; 
    } else {
      this.filteredHotels = this.allHotels.filter(h =>
        h.hotelName.toLowerCase().includes(value) ||
        h.city.toLowerCase().includes(value)
      );
    }
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();
    this.updatePage(); 
  }

  addHotel(): void {
    this.router.navigate(['/admin/hotels/add']);
  }

  editHotel(id: number): void {
    this.router.navigate(['/admin/hotels/edit', id]);
  }

  deleteHotel(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Hotel',
        message: 'Are you sure you want to delete this hotel? This action cannot be undone.',
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteHotel(id).subscribe({
          next: () => {
            this.snackBar.open('Hotel deleted successfully', 'Close', { duration: 3000 });
            this.loadHotels();
          },
          error: (err) => {
            console.error('Delete failed', err);
            this.snackBar.open('Failed to delete hotel. It might have linked rooms or assignments.', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }
}
