import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuestService } from '../../../core/services/guest-service';
import { AuthService } from '../../../core/services/auth-service';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast-service';
import { BillingService, InvoiceDetails } from '../../../core/services/billing.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PromptDialogComponent } from '../../../shared/components/prompt-dialog/prompt-dialog.component';

@Component({
  selector: 'app-guest-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatDialogModule],
  templateUrl: './guest-reservations.html',
  styleUrls: ['./guest-reservations.css']
})
export class GuestReservationsComponent implements OnInit {

  list: any[] = [];
  loading = true;
  showPaymentModal = false;
  selectedInvoice: InvoiceDetails | null = null;
  paymentProcessing = false;
  paymentSuccess = false;
  paymentMode: string = 'Card'; // Default

  constructor(
    private guest: GuestService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private billingService: BillingService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const userId = this.auth.userId;
    console.log('GuestReservations: UserID:', userId);

    if (userId > 0) {
      this.load(userId);
    } else {
      console.warn('User ID not found, maybe not logged in.');
      this.loading = false;
    }
  }

  load(userId: number) {
    this.guest.getMyReservations(userId).subscribe({
      next: (res) => {
        console.log('Reservations Loaded:', res);
        res.forEach((r: any) => console.log(`ID: ${r.reservationId}, Status: ${r.status}, PayStatus: ${r.paymentStatus}`));
        this.list = res;
        this.loading = false;
        this.cdr.detectChanges(); // Force update
      },
      error: (err) => {
        console.error('Error loading:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel(id: number) {
    const dialogRef = this.dialog.open(PromptDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Reservation',
        message: 'Please enter a reason for cancellation:',
        label: 'Reason',
        confirmText: 'Cancel Booking',
        required: true
      }
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (!reason) return; // Dismissed

      this.guest.cancelReservation(id, reason).subscribe({
        next: () => {
          this.toastService.show('Reservation cancelled.', 'success');
          this.load(this.auth.userId);
        },
        error: (err) => this.toastService.show('Failed to cancel: ' + (err.error?.message || 'Unknown error'), 'error')
      });
    });
  }
  openPaymentModal(reservationId: number) {
    this.paymentSuccess = false;
    this.paymentProcessing = true;
    this.showPaymentModal = true;
    this.selectedInvoice = null;
    this.paymentMode = 'Card'; 

    this.billingService.getInvoicePreview(reservationId).subscribe({
      next: (inv) => {
        this.selectedInvoice = inv;
        this.paymentProcessing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Failed to load invoice details', 'error');
        this.showPaymentModal = false;
        this.paymentProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }

  pay() {
    if (!this.selectedInvoice) return;

    if (this.selectedInvoice.paymentStatus === 'Paid') {
      this.toastService.show('Already Paid!', 'info');
      return;
    }


    this.paymentProcessing = true;
    const req = {
      reservationId: this.selectedInvoice.reservationId,
      amount: this.selectedInvoice.grandTotal,
      paymentMode: this.paymentMode,
      transactionRef: 'TXN-' + Math.floor(Math.random() * 1000000)
    };

    this.billingService.processPayment(req).subscribe({
      next: (res) => {
        this.paymentProcessing = false;
        this.paymentSuccess = true;
        if (this.selectedInvoice) this.selectedInvoice.paymentStatus = 'Paid';
        this.toastService.show('Payment Successful!', 'success');
        const item = this.list.find(r => r.reservationId === req.reservationId);
        if (item) {
          item.paymentStatus = 'Paid';
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.paymentProcessing = false;
        this.toastService.show('Payment Failed', 'error');
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedInvoice = null;
  }
}
