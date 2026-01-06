import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './create-user.html',
  styleUrls: ['./create-user.css']
})
export class CreateUserComponent implements OnInit {

  submitted = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(5)]],

      email: ['', [Validators.required, Validators.email]],

      phone: ['', [
        Validators.required,
        Validators.pattern(/^([6-9]\d{9})$/)
      ]],

      role: ['Manager', Validators.required],

      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/)
      ]]
    });
  }

  get f() {
    return this.form.controls;
  }

  create() {

    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.createUser(this.form.value as any).subscribe({
      next: res => {
        this.snackBar.open(res.message, 'Close', { duration: 3000 });
        this.form.reset({ role: 'Manager' });
        this.submitted = false;
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Something went wrong', 'Close', { duration: 5000 })
    });
  }
}
