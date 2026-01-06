import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceptionService } from '../../../core/services/reception-service';
import { ToastService } from '../../../core/services/toast-service';

@Component({
    selector: 'app-reception-service-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './service-requests.html',
    styleUrls: ['./service-requests.css']
})
export class ReceptionServiceRequestsComponent implements OnInit {

    @Input() hotelId!: number;

    requests: any[] = [];
    loading = false;

    selectedRequest: any = null;
    servicePrice: number | null = null;
    showServeModal = false;

    constructor(
        private receptionService: ReceptionService,
        private toast: ToastService
    ) { }

    ngOnInit() {
        if (this.hotelId) {
            this.loadRequests();
        }
    }

    loadRequests() {
        console.log('ServiceRequestsComponent: Loading for HotelId:', this.hotelId);
        this.loading = true;
        this.receptionService.getServiceRequests(this.hotelId).subscribe({
            next: (data) => {
                console.log('ServiceRequestsComponent: Loaded', data.length, 'requests');
                this.requests = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('ServiceRequestsComponent: Load Failed', err);
                this.loading = false;
            }
        });
    }

    openServeModal(req: any) {
        this.selectedRequest = req;
        this.servicePrice = null;
        this.showServeModal = true;
    }

    closeModal() {
        this.showServeModal = false;
        this.selectedRequest = null;
    }

    confirmServe() {
        if (!this.selectedRequest || this.servicePrice === null || this.servicePrice < 0) {
            this.toast.show('Please enter a valid price.', 'error');
            return;
        }

        this.receptionService.serveRequest(this.selectedRequest.requestId, this.servicePrice).subscribe({
            next: () => {
                this.toast.show('Request marked as served. Charge added.', 'success');
                this.closeModal();
                this.loadRequests(); 
            },
            error: (err) => {
                this.toast.show('Failed to update request.', 'error');
            }
        });
    }
}
