import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <h2>My Profile</h2>
        
        <form (ngSubmit)="save()">
          <!-- Full Name -->
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="user.fullName" name="fullName" required>
          </div>

          <!-- Email (Editable) -->
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="user.email" name="email" required>
          </div>

          <!-- Phone -->
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" [(ngModel)]="user.phone" name="phone" required>
          </div>

          <!-- Role (Read Only) -->
          <div class="form-group">
            <label>Role</label>
            <input type="text" [value]="user.role" disabled class="disabled-input">
          </div>

          <hr>
          <h3>Security</h3>
          <p class="hint">Leave password fields empty if you don't want to change it.</p>

          <div class="form-group">
             <label>Current Password (Required only if changing password)</label>
             <input type="password" [(ngModel)]="user.currentPassword" name="currentPassword">
          </div>

          <div class="form-group">
             <label>New Password</label>
             <input type="password" [(ngModel)]="user.newPassword" name="newPassword">
          </div>

          <div class="actions">
            <button type="button" class="cancel-btn" (click)="goBack()">Cancel</button>
            <button type="submit" class="save-btn" [disabled]="loading">
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      display: flex;
      justify-content: center;
      padding: 40px 20px;
      background: #f5f7fa;
      min-height: 80vh;
    }
    .profile-card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      width: 100%;
      max-width: 500px;
    }
    h2 { margin-bottom: 20px; color: #2c3e50; }
    h3 { margin-top: 20px; font-size: 16px; color: #34495e; }
    .hint { font-size: 12px; color: #7f8c8d; margin-bottom: 15px; }
    
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 14px; color: #34495e; }
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box; /* Fix for overflow */
    }
    input:focus { outline: none; border-color: #3498db; }
    .disabled-input { background: #f8f9fa; color: #7f8c8d; cursor: not-allowed; }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 25px;
    }
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    .cancel-btn { background: #ecf0f1; color: #2c3e50; }
    .save-btn { background: #3498db; color: white; }
    .save-btn:disabled { background: #95a5a6; cursor: not-allowed; }
  `]
})
export class ProfileComponent implements OnInit {
  user: any = {
    fullName: '',
    email: '',
    phone: '',
    role: '',
    currentPassword: '',
    newPassword: ''
  };
  loading = false;

  constructor(
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: (res) => {
        this.user = { ...res, currentPassword: '', newPassword: '' };
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
      }
    });
  }

  save() {
    this.loading = true;
    this.auth.updateProfile(this.user).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        this.loading = false;
        // Update user name in local storage/auth service if needed
        this.auth.saveUser(this.auth.token!, this.auth.role!, this.user.fullName);
        this.router.navigate(['/']); // Redirect or stay? "clicking on edit should again redirect". 
        // User request: "can edit all the details and clciking on edit should again redirect" 
        // -> Ambiguous. Redirect where? Maybe back to home or dashboard. I'll redirect to previous location or Home.
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Update failed';
        this.snackBar.open(msg, 'Close', { duration: 3000 });
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
