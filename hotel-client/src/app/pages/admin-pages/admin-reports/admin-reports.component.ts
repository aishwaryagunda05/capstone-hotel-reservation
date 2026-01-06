import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin-service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-admin-reports',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-reports.component.html',
    styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {

    stats: any = null;
    revenueData: any[] = [];
    occupancyData: any[] = [];
    summaryData: any[] = [];

    constructor(private adminService: AdminService) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        forkJoin({
            stats: this.adminService.getDashboardStats(),
            revenue: this.adminService.getRevenueTrend(),
            occupancy: this.adminService.getOccupancyReport(),
            summary: this.adminService.getReservationSummary()
        }).subscribe({
            next: (res) => {
                console.log('Reports Data:', res);
                this.stats = res.stats;
                this.revenueData = res.revenue;
                this.occupancyData = res.occupancy;
                this.summaryData = res.summary;
            },
            error: (err) => console.error('Failed to load reports', err)
        });
    }

    getColor(status: string): string {
        switch (status) {
            case 'Booked': return '#3b82f6';
            case 'CheckedIn': return '#10b981';
            case 'Cancelled': return '#ef4444';
            case 'CheckedOut': return '#6366f1';
            default: return '#94a3b8';
        }
    }

    viewWidth = 600;
    viewHeight = 300;
    padding = 40;
    get areaPath(): string {
        return this.generatePath(true);
    }
    get linePath(): string {
        return this.generatePath(false);
    }

    private generatePath(isArea: boolean): string {
        if (!this.revenueData || this.revenueData.length === 0) return '';

        const data = this.revenueData.map(d => d.revenue);
        const maxVal = Math.max(...data, 100); 
        const minVal = 0;
        const stepX = (this.viewWidth - this.padding * 2) / (data.length - 1 || 1);
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
            d += ` L ${x} ${y}`;
        });

        if (isArea) {
            const lastX = this.padding + ((data.length - 1) * stepX);
            d += ` L ${lastX} ${this.viewHeight - this.padding} L ${this.padding} ${this.viewHeight - this.padding} Z`;
        }

        return d;
    }
    get summaryLinePath(): string {
        if (!this.summaryData || this.summaryData.length === 0) return '';

        const data = this.summaryData.map(d => d.count);
        const maxVal = Math.max(...data, 10);
        const stepX = (this.viewWidth - this.padding * 2) / (data.length - 1 || 1);

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
            d += ` L ${x} ${y}`;
        });

        return d;
    }

    get summaryAreaPath(): string {
        if (!this.summaryData || this.summaryData.length === 0) return '';
        const line = this.summaryLinePath;
        const stepX = (this.viewWidth - this.padding * 2) / (this.summaryData.length - 1 || 1);
        const lastX = this.padding + ((this.summaryData.length - 1) * stepX);
        return `${line} L ${lastX} ${this.viewHeight - this.padding} L ${this.padding} ${this.viewHeight - this.padding} Z`;
    }
}
