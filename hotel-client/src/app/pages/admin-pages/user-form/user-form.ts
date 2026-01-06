import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin-service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.css']
})
export class UserFormComponent implements OnInit {

  userForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  submitted = false;

  roles = ['Admin', 'Manager', 'Receptionist', 'Guest'];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    this.userForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^([6-9]\d{9})$/)]],
      role: ['Guest', Validators.required],
      password: ['']  // required only on create
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.loadUser(this.userId);
      this.userForm.controls['password'].clearValidators();
    }
    else {
      this.userForm.controls['password']
        .setValidators([Validators.required, Validators.minLength(6)]);
    }

    this.userForm.controls['password'].updateValueAndValidity();
  }

  loadUser(id: number) {
    this.loading = true;

    this.adminService.getUser(id).subscribe({
      next: (u: any) => {
        this.userForm.patchValue({
          userName: u.fullName,
          email: u.email,
          phone: u.phone,
          role: u.role
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.userForm.invalid) return;

    this.loading = true;
    const payload: any = {
      fullName: this.userForm.value.userName,
      email: this.userForm.value.email,
      phone: this.userForm.value.phone,
      role: this.userForm.value.role
    };

    if (this.userForm.value.password) {
      payload.password = this.userForm.value.password;
    }


    if (this.isEditMode && this.userId) {

      this.adminService.updateUser(this.userId, payload).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });

    } else {

      this.adminService.createUser(payload).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });

    }
  }

  handleSuccess() {
    this.loading = false;
    this.snackBar.open('User saved successfully', 'Close', { duration: 3000 });
    this.router.navigate(['/admin/users']);
  }

  handleError(err: any) {
    console.error(err);
    this.loading = false;
    this.snackBar.open(err?.error?.message ?? 'An error occurred. Please try again.', 'Close', { duration: 3000 });
  }

  get f() { return this.userForm.controls; }
}
