import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    constructor(private snackBar: MatSnackBar) { }

    show(message: string, type: 'success' | 'error' | 'info' = 'info') {
        let panelClass = 'toast-info';
        if (type === 'success') panelClass = 'toast-success';
        if (type === 'error') panelClass = 'toast-danger';

        this.snackBar.open(message, 'OK', {
            panelClass: [panelClass],
            duration: 5000
        });
    }

    // remove(id: number) { }
}
