import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-prompt-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule, MatInputModule, MatFormFieldModule, FormsModule],
    template: `
    <h2 mat-dialog-title>{{ data.title || 'Enter Value' }}</h2>
    <mat-dialog-content>
      <p *ngIf="data.message">{{ data.message }}</p>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>{{ data.label || 'Value' }}</mat-label>
        <input matInput [(ngModel)]="value" (keyup.enter)="onConfirm()">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onDismiss()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!value && data.required" (click)="onConfirm()">{{ data.confirmText || 'Submit' }}</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .w-100 { width: 100%; }
    h2 { font-family: 'Outfit', sans-serif; font-weight: 700; }
  `]
})
export class PromptDialogComponent {
    value: string = '';

    constructor(
        public dialogRef: MatDialogRef<PromptDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { title: string; message?: string; label?: string; confirmText?: string; required?: boolean; defaultValue?: string }
    ) {
        if (data.defaultValue) {
            this.value = data.defaultValue;
        }
    }

    onConfirm(): void {
        this.dialogRef.close(this.value);
    }

    onDismiss(): void {
        this.dialogRef.close(null);
    }
}
