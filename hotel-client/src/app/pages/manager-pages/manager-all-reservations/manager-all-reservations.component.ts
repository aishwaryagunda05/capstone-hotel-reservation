import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ManagerService } from '../../../core/services/manager-service';
import { MaterialModule } from '../../../material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
    selector: 'app-manager-all-reservations',
    standalone: true,
    imports: [CommonModule, MaterialModule, MatSortModule],
    templateUrl: './manager-all-reservations.component.html',
    styleUrls: ['./manager-all-reservations.component.css']
})
export class ManagerAllReservationsComponent implements OnInit {

    dataSource = new MatTableDataSource<any>([]);
    displayedColumns: string[] = ['hotelName', 'guestName', 'room', 'price', 'status', 'payment'];

    @ViewChild(MatPaginator) set paginator(pager: MatPaginator) {
        if (pager) this.dataSource.paginator = pager;
    }
    @ViewChild(MatSort) set sort(sorter: MatSort) {
        if (sorter) this.dataSource.sort = sorter;
    }

    hotelId: number = 0;
    loading: boolean = true;
    errorMsg: string = '';

    constructor(
        private managerService: ManagerService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('hotelId');
            this.hotelId = id ? +id : 0; // 0 implies all hotels
            this.loadReservations();
        });

        // Custom Sorting
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'hotelName': return item.hotelName;
                case 'guestName': return item.guestName;
                case 'room': return item.roomNumbers ? item.roomNumbers.join(', ') : '';
                case 'price': return item.totalPrice;
                case 'status': return item.status;
                case 'payment': return item.paymentStatus;
                default: return item[property];
            }
        };
    }

    loadReservations() {
        this.loading = true;
        this.managerService.getManagerReservations(this.hotelId).subscribe({
            next: (res) => {
                console.log('Manager All Reservations:', res);
                const enhancedData = (res || []).map((r: any) => ({
                    ...r,
                    status: r.status || 'Booked',
                    paymentStatus: (r.paymentStatus || 'Pending'),
                    hotelName: r.hotelName || r.hotel?.name || 'Unknown Hotel'
                }));

                this.dataSource.data = enhancedData;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load reservations', err);
                this.errorMsg = `Failed to load reservations.`;
                this.loading = false;
                this.cdr.detectChanges();
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
}
