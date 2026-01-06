import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {

  form!: FormGroup;
  submitted = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private notify: NotificationService
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      fullName: ['', [
        Validators.required,
        Validators.minLength(5)
      ]],

      email: ['', [
        Validators.required,
        Validators.email
      ]],

      phone: ['', [
        Validators.required,
        Validators.pattern(/^([6-9]\d{9})$/)
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/)
      ]]
    });
  }

  get f() { return this.form.controls; }

  register() {

    this.submitted = true; 

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.register(this.form.value).subscribe({
      next: res => {
        this.notify.showToast(res.message || 'Registration Successful!', 'Success');
        this.router.navigate(['/login']);
      },
      error: err => {
        this.notify.showToast(err.error?.message ?? 'Registration failed', 'Warning');
      }
    });
  }
}
