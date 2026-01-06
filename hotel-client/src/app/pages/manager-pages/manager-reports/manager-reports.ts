import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../core/services/manager-service';
import { forkJoin, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-manager-reports',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './manager-reports.html',
    styleUrls: ['./manager-reports.css']
})
export class ManagerReportsComponent implements OnInit {

    stats: any = null;
    revenueData: any[] = [];
    distribution: any[] = [];
    breakdownData: any[] = [];
    hotelId: number = 0;
    assignedHotels: any[] = [];
    errorMsg: string = '';

    constructor(
        private managerService: ManagerService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) { }

    ngOnInit() {
        // Fetch list of assigned hotels for dropdown
        this.managerService.getAssignedHotels().subscribe({
            next: (hotels: any[]) => {
                this.assignedHotels = hotels || [];
            }
        });

        this.route.paramMap.subscribe(params => {
            const id = params.get('hotelId');
            if (id) {
                this.hotelId = +id;
                this.loadData();
            }
        });
    }



    onHotelChange(newId: string | number) {
        this.router.navigate(['/manager/reports', newId]);
    }

    get currentHotelName(): string {
        if (this.hotelId === 0) return 'Combined Reports';
        const hotel = this.assignedHotels.find(h => h.hotelId === this.hotelId);
        // Fallback to breakdownData if not found in sidebar list
        if (!hotel) {
            const h2 = this.breakdownData.find((h: any) => h.hotelId === this.hotelId);
            return h2 ? h2.hotelName : 'Hotel Performance';
        }
        return hotel ? hotel.hotelName : 'Hotel Performance';
    }

    loadData() {
        // Fix: Allow 0 (Combined Reports) to pass
        if (this.hotelId === undefined || this.hotelId === null) return;

        forkJoin({
            stats: this.managerService.getManagerStats(this.hotelId),
            revenue: this.managerService.getManagerRevenueTrend(this.hotelId),
            distribution: this.managerService.getManagerReservationDistribution(this.hotelId),
            // Always fetch breakdown to support "Revenue Report" requirement even for single hotels
            breakdown: this.managerService.getHotelBreakdown()
        }).subscribe({
            next: (res) => {
                console.log('Manager Reports Data:', res);
                this.stats = res.stats;
                this.revenueData = res.revenue;

                // Merge with default statuses to ensure Legend is complete
                const allStatuses = ['Booked', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'];
                const mergedDist = allStatuses.map(status => {
                    const existing = res.distribution.find((d: any) => d.status === status);
                    return existing ? existing : { status: status, count: 0 };
                });

                // Append any other weird statuses if they exist
                res.distribution.forEach((d: any) => {
                    if (!allStatuses.includes(d.status)) mergedDist.push(d);
                });

                this.distribution = mergedDist;
                this.breakdownData = res.breakdown;
                this.cdr.detectChanges(); // Force update
            },
            error: (err) => {
                console.error('Failed to load reports', err);
                this.errorMsg = `Failed to load data. Server Status: ${err.status} ${err.statusText}. Details: ${JSON.stringify(err.error)}`;
                this.cdr.detectChanges(); // Force update
            }
        });
    }

    getColor(status: string): string {
        switch (status) {
            case 'Booked': return '#3b82f6'; // Blue
            case 'Confirmed': return '#f59e0b'; // Amber
            case 'CheckedIn': return '#10b981'; // Green
            case 'CheckedOut': return '#6366f1'; // Indigo
            case 'Cancelled': return '#ef4444'; // Red
            default: return '#94a3b8';
        }
    }

    // --- CHART LOGIC ------------------------

    // SVG ViewBox dimensions
    viewWidth = 600;
    viewHeight = 300;
    padding = 40;

    /** Generates the SVG Path for the Area fill */
    get areaPath(): string {
        return this.generatePath(true);
    }

    /** Generates the SVG Path for the Stroke Line */
    get linePath(): string {
        return this.generatePath(false);
    }

    private generatePath(isArea: boolean): string {
        if (!this.revenueData || this.revenueData.length === 0) return '';

        const data = this.revenueData.map(d => d.revenue);
        const maxVal = Math.max(...data, 100); // Avoid div by zero
        // const minVal = 0;

        // X coordinate calculation
        const stepX = (this.viewWidth - this.padding * 2) / (data.length - 1 || 1);

        // Y coordinate calculation (invert because SVG Y=0 is top)
        const getY = (val: number) => {
            const height = this.viewHeight - this.padding * 2;
            const normalized = val / maxVal;
            return this.viewHeight - this.padding - (normalized * height);
        }

        let d = `M ${this.padding} ${getY(data[0])}`;

        data.forEach((val, i) => {
            if (i === 0) return;
            const x = this.padding + (i * stepX);
            const y = getY(val);
            // Simple straight line connection
            d += ` L ${x} ${y}`;
        });

        if (isArea) {
            // Close the path for fill
            const lastX = this.padding + ((data.length - 1) * stepX);
            d += ` L ${lastX} ${this.viewHeight - this.padding} L ${this.padding} ${this.viewHeight - this.padding} Z`;
        }

        return d;
    }

    getDate(): Date {
        return new Date();
    }

    extractDate(activeGuests: number): string | null {
        // Just a placeholder helper if needed for dynamic date display logic
        return null;
    }

    get distributionCount(): number {
        return this.distribution ? this.distribution.reduce((acc, curr) => acc + curr.count, 0) : 0;
    }

    /** Generates Conic Gradient string for Donut Chart */
    get pieGradient(): string {
        if (!this.distribution || this.distribution.length === 0) return 'conic-gradient(#e2e8f0 0% 100%)';

        let gradient = 'conic-gradient(';
        let startPercent = 0;
        const total = this.distributionCount;

        if (total === 0) return 'conic-gradient(#e2e8f0 0% 100%)';

        this.distribution.forEach((item, index) => {
            const percent = (item.count / total) * 100;
            const endPercent = startPercent + percent;
            const color = this.getColor(item.status);

            gradient += `${color} ${startPercent}% ${endPercent}%`;
            if (index < this.distribution.length - 1) gradient += ', ';

            startPercent = endPercent;
        });

        gradient += ')';
        return gradient;
    }
}
