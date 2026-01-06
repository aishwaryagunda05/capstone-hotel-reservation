import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin-service';
import { RoomType } from '../../../models/RoomType';
import { Hotel } from '../../../models/Hotel';
import { forkJoin } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-room-form',
  templateUrl: './room-form.html',
  styleUrls: ['./room-form.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class RoomFormComponent implements OnInit {

  form!: FormGroup;
  hotels: Hotel[] = [];
  allRoomTypes: RoomType[] = [];
  filteredRoomTypes: RoomType[] = [];

  isEdit = false;
  id!: number;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: AdminService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      hotelId: ['', Validators.required],
      roomTypeId: ['', Validators.required],
      roomNumber: ['', Validators.required],
      status: ['Available', Validators.required]
    });

    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.id;

    this.loading = true;
    forkJoin({
      hotels: this.service.getHotels(),
      types: this.service.getRoomTypes()
    }).subscribe({
      next: (res) => {
        this.hotels = res.hotels || [];
        this.allRoomTypes = res.types || [];

        if (this.isEdit) {
          this.loadRoom();
        } else {
          this.loading = false;
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error("Error loading room form data", err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });

    this.form.get('hotelId')?.valueChanges.subscribe(hotelId => {
      this.filterRoomTypes(hotelId);
    });
  }

  filterRoomTypes(hotelId: any) {
    if (!hotelId) {
      this.filteredRoomTypes = [];
    } else {
      this.filteredRoomTypes = this.allRoomTypes.filter(t => t.hotelId === Number(hotelId));
    }
    const currentType = this.form.get('roomTypeId')?.value;
    if (currentType && !this.filteredRoomTypes.some(t => t.roomTypeId === Number(currentType))) {
      this.form.patchValue({ roomTypeId: '' });
    }
    this.cd.detectChanges();
  }

  loadRoom() {
    this.service.getRoom(this.id).subscribe(r => {
      this.form.patchValue(r);
      this.filterRoomTypes(r.hotelId);
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  submit() {
    if (this.form.invalid) return;

    const navExtras = { queryParams: { hotelId: this.form.value.hotelId } };

    if (this.isEdit) {
      this.service.updateRoom(this.id, this.form.value)
        .subscribe(() => this.router.navigate(['/admin/rooms'], navExtras));
    } else {
      this.service.createRoom(this.form.value)
        .subscribe(() => this.router.navigate(['/admin/rooms'], navExtras));
    }
  }
}
