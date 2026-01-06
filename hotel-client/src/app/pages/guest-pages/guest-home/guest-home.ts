import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { BillingService } from '../../../core/services/billing.service';

@Component({
  selector: 'app-guest-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './guest-home.html',
  styleUrls: ['./guest-home.css']
})
export class GuestHomeComponent implements OnInit {

  invoices: any[] = [];
  loading = true;

  constructor(
    private router: Router,
    private auth: AuthService,
    private billing: BillingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.loadInvoices(user.userId);
      }
    });

    // Also fallback if subscription doesn't fire immediately
    const userId = this.auth.userId;
    if (userId) {
      this.loadInvoices(userId);
    }
  }

  loadInvoices(userId: number) {
    this.billing.getGuestInvoices(userId).subscribe({
      next: (data) => {
        this.invoices = data.filter((inv: any) => inv.paymentStatus === 'Paid');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load invoices', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
