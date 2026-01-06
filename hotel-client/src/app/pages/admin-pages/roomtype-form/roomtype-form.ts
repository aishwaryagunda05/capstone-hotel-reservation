import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin-service';
import { Hotel } from '../../../models/Hotel';
import { MaterialModule } from '../../../material.module';
import { forkJoin } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-roomtype-form',
  templateUrl: './roomtype-form.html',
  styleUrls: ['./roomtype-form.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MaterialModule]
})
export class RoomTypeFormComponent implements OnInit {

  form!: FormGroup;
  isEdit = false;
  id!: number;
  hotels: Hotel[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: AdminService) { }

  ngOnInit(): void {
    this.service.getHotels().subscribe(data => this.hotels = data || []);

    this.form = this.fb.group({
      hotelIds: [[], Validators.required], // Array for multiple hotels
      roomTypeName: ['', Validators.required],
      description: [''],
      basePrice: [0, [Validators.required]],
      maxGuests: [1, [Validators.required]]
    });

    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.id;

    if (this.isEdit) {
      this.service.getRoomType(this.id).subscribe(r => {
        if (r) {
          this.form.patchValue({
            ...r,
            hotelIds: [r.hotelId]
          });
        }
      });
    }
  }

  submit() {
    if (this.form.invalid) return;

    const val = this.form.value;

    if (this.isEdit) {
      const dto = {
        ...val,
        hotelId: val.hotelIds[0]
      };
      this.service.updateRoomType(this.id, dto)
        .subscribe(() => this.router.navigate(['/admin/roomtypes']));
    }
    else {
      // Create for each selected hotel
      const obs = val.hotelIds.map((hId: number) => {
        const dto = {
          ...val,
          hotelId: hId
        };
        return this.service.createRoomType(dto);
      });

      forkJoin(obs).subscribe(() => this.router.navigate(['/admin/roomtypes']));
    }
  }

  getHotelName(id: number): string {
    return this.hotels.find(h => h.hotelId === id)?.hotelName ?? '';
  }
}
