import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../core/services/admin-service';
import { SeasonalPrice } from '../../../models/SeasonalPrice';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

export interface SeasonalPriceView extends SeasonalPrice {
  hotelName: string;
  roomTypeName: string;
}

@Component({
  selector: 'app-seasonal-prices-list',
  standalone: true,
  templateUrl: './seasonal-prices-list.html',
  styleUrls: ['./seasonal-prices-list.css'],
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    MatSnackBarModule
  ]
})
export class SeasonalPricesListComponent implements OnInit {

  allSeasonalPrices: SeasonalPriceView[] = [];
  filteredPrices: SeasonalPriceView[] = [];
  loading = true;

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      prices: this.adminService.getSeasonalPrices(),
      hotels: this.adminService.getHotels(),
      roomTypes: this.adminService.getRoomTypes()
    })
      .subscribe({
        next: (res: any) => {
          const { prices, hotels, roomTypes } = res;
          this.allSeasonalPrices = (prices || []).map((p: any) => ({
            ...p,
            hotelName:
              (hotels || []).find((h: any) => h.hotelId === p.hotelId)?.hotelName
              ?? 'Unknown Hotel',
            roomTypeName:
              (roomTypes || []).find((r: any) => r.roomTypeId === p.roomTypeId)?.roomTypeName
              ?? 'Unknown Room'
          }));
          this.filteredPrices = [...this.allSeasonalPrices];
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (err: any) => {
          console.error("Error loading seasonal prices", err);
          this.loading = false;
          this.cd.detectChanges();
        }
      });
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (!value) {
      this.filteredPrices = [...this.allSeasonalPrices];
    } else {
      this.filteredPrices = this.allSeasonalPrices.filter(s =>
        s.hotelName.toLowerCase().includes(value) ||
        s.roomTypeName.toLowerCase().includes(value)
      );
    }
  }

  delete(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Seasonal Price',
        message: 'Are you sure you want to delete this seasonal price?',
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteSeasonalPrice(id).subscribe({
          next: () => {
            this.snackBar.open('Seasonal price deleted', 'Close', { duration: 3000 });
            this.allSeasonalPrices = this.allSeasonalPrices.filter(x => x.seasonalPriceId !== id);
            this.filteredPrices = this.filteredPrices.filter(x => x.seasonalPriceId !== id);
          },
          error: (err) => {
            console.error('Delete failed', err);
            this.snackBar.open('Failed to delete. It might be in use.', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }
}
