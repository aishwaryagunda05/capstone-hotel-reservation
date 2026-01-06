import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../core/services/admin-service';

import { SeasonalPrice } from '../../../models/SeasonalPrice';
import { Hotel } from '../../../models/Hotel';
import { RoomType } from '../../../models/RoomType';

@Component({
  selector: 'app-seasonal-price-form',
  standalone: true,
  templateUrl: './seasonal-price-form.html',
  styleUrls: ['./seasonal-price-form.css'],
  imports: [CommonModule, FormsModule]
})
export class SeasonalPriceFormComponent implements OnInit {

  title = 'Add Seasonal Price';
  id?: number;
  isEdit = false;
  loading = true;

  model: SeasonalPrice = {
    seasonalPriceId: 0,
    hotelId: 0,
    roomTypeId: 0,
    startDate: '',
    endDate: '',
    pricePerNight: 0
  };

  hotels: Hotel[] = [];
  allRoomTypes: RoomType[] = [];
  filteredRoomTypes: RoomType[] = [];

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.cd.detectChanges();

    forkJoin({
      hotels: this.adminService.getHotels(),
      types: this.adminService.getRoomTypes()
    }).subscribe({
      next: (res) => {
        this.hotels = res.hotels || [];
        this.allRoomTypes = res.types || [];

        const routeId = this.route.snapshot.paramMap.get('id');
        this.id = routeId ? Number(routeId) : undefined;
        this.isEdit = !!this.id;

        if (this.isEdit && this.id) {
          this.title = 'Edit Seasonal Price';
          this.adminService.getSeasonalPrice(this.id).subscribe(res => {
            this.model = res;
            this.model.startDate = res.startDate.substring(0, 10);
            this.model.endDate = res.endDate.substring(0, 10);
            this.filterRoomTypes(res.hotelId);
            this.loading = false;
            this.cd.detectChanges();
          });
        } else {
          this.loading = false;
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error("Error loading seasonal price form data", err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  onHotelChange(hotelId: any) {
    this.filterRoomTypes(hotelId);
    // Reset room type if it's not valid for the new hotel
    if (this.model.roomTypeId && !this.filteredRoomTypes.some(t => t.roomTypeId === Number(this.model.roomTypeId))) {
      this.model.roomTypeId = 0;
    }
    this.cd.detectChanges();
  }

  filterRoomTypes(hotelId: any) {
    if (!hotelId || hotelId == 0) {
      this.filteredRoomTypes = [];
    } else {
      this.filteredRoomTypes = this.allRoomTypes.filter(t => t.hotelId === Number(hotelId));
    }
  }

  save() {
    if (this.isEdit && this.id) {
      this.adminService.updateSeasonalPrice(this.id, this.model)
        .subscribe(() => this.router.navigate(['/admin/seasonal-prices']));
    }
    else {
      this.adminService.createSeasonalPrice(this.model)
        .subscribe(() => this.router.navigate(['/admin/seasonal-prices']));
    }
  }
}
