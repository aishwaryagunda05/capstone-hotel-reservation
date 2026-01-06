import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin-service';
import { Hotel } from '../../../models/Hotel';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './hotel-form.html',
  styleUrls: ['./hotel-form.css']
})
export class HotelFormComponent implements OnInit {
  hotelForm: FormGroup;
  isEditMode = false;
  hotelId: number | null = null;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.hotelForm = this.fb.group({
      hotelName: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{5,6}$')]],
      state: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.hotelId = +id;
      this.loadHotel(this.hotelId);
    }
  }

  loadHotel(id: number): void {
    this.loading = true;
    this.adminService.getHotel(id).subscribe({
      next: (hotel) => {
        this.hotelForm.patchValue(hotel);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load hotel', err);
        this.loading = false;
        // Optional: Navigate back or show error
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.hotelForm.invalid) {
      return;
    }

    this.loading = true;
    const hotelData: Hotel = this.hotelForm.value;

    if (this.isEditMode && this.hotelId) {
      hotelData.hotelId = this.hotelId; // Ensure ID is present for update
      this.adminService.updateHotel(this.hotelId, hotelData).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    } else {
      this.adminService.createHotel(hotelData).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    }
  }

  handleSuccess(): void {
    this.loading = false;
    this.snackBar.open('Hotel saved successfully', 'Close', { duration: 3000 });
    this.router.navigate(['/admin/hotels']);
  }

  handleError(err: any): void {
    console.error('Operation failed', err);
    this.loading = false;
    if (err.status === 409) {
      this.snackBar.open(err.error?.message || 'A hotel with the same name, city, and pincode already exists.', 'Close', { duration: 5000 });
    } else {
      this.snackBar.open('An error occurred. Please try again.', 'Close', { duration: 3000 });
    }
  }

  get f() { return this.hotelForm.controls; }
}
