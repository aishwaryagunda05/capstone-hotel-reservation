import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReceptionService } from '../../../core/services/reception-service';
import { AuthService } from '../../../core/services/auth-service';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast-service';
import { MaterialModule } from '../../../material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { ReceptionServiceRequestsComponent } from '../service-requests/service-requests';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PromptDialogComponent } from '../../../shared/components/prompt-dialog/prompt-dialog.component';

@Component({
  selector: 'app-reception-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ReceptionServiceRequestsComponent, MatDialogModule, MaterialModule, MatSortModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class ReceptionDashboard implements OnInit, AfterViewInit {
  billingsDataSource = new MatTableDataSource<any>([]);
  billingColumns: string[] = ['hotelName', 'guestName', 'roomNumber', 'totalAmount', 'status', 'paymentStatus'];

  @ViewChild('billingPaginator') billingPaginator!: MatPaginator;
  @ViewChild('billingSort') billingSort!: MatSort;

  pendingCheckins: any[] = [];
  activeCheckins: any[] = [];

  viewMode: 'dashboard' | 'walkin' | 'requests' | 'billings' = 'dashboard';
  walkInStep: 'register' | 'search' | 'rooms' = 'register';
  guestForm!: FormGroup;
  registeredUserId: number | null = null;
  assignedHotelId: number | null = null;
  assignedHotelName = '';
  today = new Date();
  currentUser: any = {};
  selectedRoomIds: number[] = [];

  searchForm = { checkInDate: '', checkOutDate: '', guests: 1 };
  availableRooms: any[] = [];

  errorMessage = '';
  loading = false;
  submitted = false;
  showProfile = false;

  constructor(
    private receptionService: ReceptionService,
    public auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadReservations();
    this.fetchUserProfile();
    this.receptionService.getAssignedHotelInfo().subscribe({
      next: (res) => {
        this.assignedHotelId = res.hotelId;
        this.cdr.detectChanges();
      },
      error: () => console.error('Could not fetch assigned hotel')
    });
  }

  ngAfterViewInit() {
    this.bindTableFeatures();
  }

  bindTableFeatures() {
    if (this.billingPaginator) {
      this.billingsDataSource.paginator = this.billingPaginator;
    }
    if (this.billingSort) {
      this.billingsDataSource.sort = this.billingSort;

      this.billingsDataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'itemOrder':
            const s = (item.status || '').toLowerCase();
            // Custom sort: Active/Pending on top, others below
            if (['checkedin', 'confirmed', 'booked', 'pending'].includes(s)) return 1;
            return 2;
          case 'totalAmount': return item.totalAmount;
          case 'paymentStatus': return item.paymentStatus;
          case 'status': return item.status;
          default: return item[property];
        }
      };
    }
  }

  fetchUserProfile() {
    this.auth.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: () => {
        this.currentUser = {
          fullName: this.auth.name,
          email: 'N/A'
        };
      }
    });
  }

  get f() { return this.guestForm.controls; }

  initForm() {
    this.guestForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^([6-9]\d{9})$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/)
      ]]
    });
  }

  loadReservations() {
    this.loading = true;
    this.errorMessage = '';

    this.receptionService.getAssignedHotelReservations()
      .subscribe({
        next: (data) => {
          if (!data) data = [];
          let commonHotelName = '';
          if (data.length > 0) {
            const itemWithHotel = data.find((x: any) => {
              const name = x.hotelName || (x.hotel && x.hotel.name);
              return name && name !== 'Unknown Hotel';
            });
            if (itemWithHotel) {
              commonHotelName = itemWithHotel.hotelName || itemWithHotel.hotel?.name;
            }
          }
          this.assignedHotelName = commonHotelName || 'My Hotel';
          const mappedData = data.map(r => {
            let hName = r.hotelName || r.hotel?.name;
            if (hName === 'Unknown Hotel') hName = null;
            const finalHotelName = hName || commonHotelName || (r.hotelId ? 'Loading...' : 'N/A');

            return {
              ...r,
              hotelName: finalHotelName,
              roomCount: r.rooms ? r.rooms.length : 0,
              roomNumbers: r.rooms ? r.rooms.map((rm: any) => rm.roomNumber).join(', ') : '-',
              paymentStatus: (r.status === 'CheckedIn' || r.status === 'CheckedOut' || r.paymentStatus === 'Paid') ? 'Paid' : 'Pending',
              itemOrder: (['checkedin', 'confirmed', 'booked', 'pending'].includes((r.status || '').toLowerCase())) ? 1 : 2
            };
          });

          this.pendingCheckins = mappedData.filter(r => (r.status || '').toLowerCase() === 'confirmed');
          this.activeCheckins = mappedData.filter(r => (r.status || '').toLowerCase() === 'checkedin');
          this.billingsDataSource.data = mappedData;
          this.billingsDataSource.data.sort((a, b) => a.itemOrder - b.itemOrder);
          setTimeout(() => this.bindTableFeatures(), 0);

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to load reservations. Please check connection.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  applyBillingFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.billingsDataSource.filter = filterValue.trim().toLowerCase();
    if (this.billingsDataSource.paginator) {
      this.billingsDataSource.paginator.firstPage();
    }
  }
  checkIn(id: number) {
    this.receptionService.checkInGuest(id).subscribe({
      next: () => {
        this.toastService.show('Check-in Successful!', 'success');
        this.loadReservations();
      },
      error: (err) => this.toastService.show(err.error?.message || 'Check-in failed', 'error')
    });
  }

  checkOut(id: number) {
    const dialogRef = this.dialog.open(PromptDialogComponent, {
      width: '400px',
      data: {
        title: 'Check Out Guest',
        message: 'Please enter any breakage fee or additional charges (defaults to 0).',
        label: 'Breakage Fee (₹)',
        confirmText: 'Complete Check-out',
        defaultValue: '0',
        required: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result !== null) {
        const fee = parseFloat(result || '0');
        this.receptionService.checkOutGuest(id, fee).subscribe({
          next: () => {
            this.toastService.show('Check-out Successful!', 'success');
            this.loadReservations();
          },
          error: (err) => this.toastService.show(err.error?.message || 'Check-out failed', 'error')
        });
      }
    });
  }

  toggleView(mode: 'dashboard' | 'walkin' | 'requests' | 'billings') {
    this.viewMode = mode;
    this.errorMessage = '';

    if (mode === 'walkin') {
      this.walkInStep = 'register';
      this.registeredUserId = null;
      this.resetForms();
    } else if (mode === 'billings') {
      this.loadReservations();
      setTimeout(() => this.bindTableFeatures(), 100);
    } else if (mode === 'dashboard') {
      this.loadReservations();
    }
    this.cdr.detectChanges();
  }

  toggleProfile() { this.showProfile = !this.showProfile; }
  goToProfile() { this.router.navigate(['/profile']); }
  logout() { this.auth.logout(); this.router.navigate(['/login']); }

  resetForms() {
    this.submitted = false;
    if (this.guestForm) this.guestForm.reset();
    this.searchForm = { checkInDate: '', checkOutDate: '', guests: 1 };
    this.availableRooms = [];
    this.selectedRoomIds = [];
  }

  registerGuest() {
    this.submitted = true;
    if (this.guestForm.invalid) {
      this.guestForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.receptionService.registerGuest(this.guestForm.value).subscribe({
      next: (res) => {
        this.registeredUserId = res.data.userId;
        this.toastService.show('Guest Registered!', 'success');
        this.walkInStep = 'search';
        this.cdr.detectChanges();
      },
      error: (err) => {
        let msg = 'Registration failed';
        if (err.error?.errors) {
          msg = Object.values(err.error.errors).flat().join(', ');
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        this.toastService.show(msg, 'error');
        this.cdr.detectChanges();
      }
    });
  }

  searchRooms() {
    if (!this.assignedHotelId) {
      this.toastService.show('Error: No hotel assigned.', 'error');
      return;
    }
    const req = {
      hotelId: this.assignedHotelId,
      ...this.searchForm
    };

    this.receptionService.searchRooms(req).subscribe({
      next: (rooms) => {
        this.availableRooms = rooms;
        this.walkInStep = 'rooms';
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Search failed';
        this.toastService.show(msg, 'error');
        this.cdr.detectChanges();
      }
    });
  }

  toggleRoomSelection(roomId: number) {
    if (this.selectedRoomIds.includes(roomId)) {
      this.selectedRoomIds = this.selectedRoomIds.filter(id => id !== roomId);
    } else {
      this.selectedRoomIds.push(roomId);
    }
  }

  confirmWalkInBooking() {
    if (this.selectedRoomIds.length === 0) return;

    const req = {
      guestUserId: this.registeredUserId,
      hotelId: this.assignedHotelId,
      checkInDate: this.searchForm.checkInDate,
      checkOutDate: this.searchForm.checkOutDate,
      roomIds: this.selectedRoomIds
    };

    this.receptionService.createWalkInReservation(req).subscribe({
      next: () => {
        this.toastService.show('Walk-in Booking Confirmed!', 'success');
        this.selectedRoomIds = [];
        this.toggleView('dashboard');
      },
      error: (err) => this.toastService.show('Booking failed', 'error')
    });
  }
}
