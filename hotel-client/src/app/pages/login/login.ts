import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { jwtDecode } from 'jwt-decode';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  model = { email: '', password: '' };
  errorMessage: string = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) { }

  login() {
    this.errorMessage = '';
    console.log('Login attempt with:', this.model);
    this.auth.login(this.model).subscribe({
      next: res => {
        console.log('Login successful:', res);

        if (res.data && res.data.token) {
          try {
            const decoded = jwtDecode(res.data.token);
            console.log('Decoded Token Claims:', decoded);
          } catch (e) {
            console.error('Could not decode token', e);
          }
        }

        if (!res || !res.data) {
          console.error('Invalid response structure');
          return;
        }

        const role = res.data.role || '';
        this.auth.saveUser(res.data.token, role, res.data.fullName);

        if (role === 'Admin')
          this.router.navigate(['/admin']);
        else if (role === 'Manager')
          this.router.navigate(['/manager']);
        else if (role === 'Receptionist')
          this.router.navigate(['/reception/reservations']);
        else
          this.router.navigate(['/guest/hotels']);
      },
      error: err => {
        console.error('Login error:', err);
                this.errorMessage = err.error?.message || 'Invalid email or password';
      }
    });
  }
}
