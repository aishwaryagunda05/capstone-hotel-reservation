import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin-service';
import { User } from '../../../models/User';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, MatPaginatorModule, MatSnackBarModule, MatTableModule, MatSortModule],
    templateUrl: './users.html',
    styleUrls: ['./users.css']
})
export class UsersComponent implements OnInit, AfterViewInit {
    users: User[] = [];
    loading = true;
    pagedUsers: User[] = [];
    pageSize = 10;
    pageIndex = 0;
    dataSource = new MatTableDataSource<User>([]);
    displayedColumns: string[] = ['fullName', 'email', 'role', 'phone', 'actions'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private adminService: AdminService,
        private router: Router,
        private cd: ChangeDetectorRef,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    loadUsers(): void {
        this.loading = true;
        this.adminService.getUsers().subscribe({
            next: (res) => {
                this.users = res;
                this.dataSource.data = res;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;

                this.loading = false;
                this.cd.detectChanges();
            },
            error: (err) => {
                console.error('Error loading users', err);
                this.loading = false;
                this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
                this.cd.detectChanges();
            }
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    onPageChange(event: any) {
        // Legacy logic - can potentially be removed if only using MatTable
        // Keeping for now if template still relies on pagedUsers fallback
    }

    addUser(): void {
        this.router.navigate(['/admin/users/add']);
    }

    editUser(id: number): void {
        this.router.navigate(['/admin/users/edit', id]);
    }

    deleteUser(id: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Delete User',
                message: 'Are you sure you want to delete this user? This action cannot be undone.',
                confirmText: 'Delete'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.adminService.deleteUser(id).subscribe({
                    next: () => {
                        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
                        this.loadUsers();
                    },
                    error: (err) => {
                        console.error('Delete failed', err);
                        this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }
}
