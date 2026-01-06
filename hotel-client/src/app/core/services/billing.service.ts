import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InvoiceDetails {
  reservationId: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  rooms: {
    roomNumber: string;
    roomType: string;
    pricePerNight: number;
    nights: number;
    total: number;
  }[];
  roomTotal: number;
  breakageFee: number;
  serviceCharges: number;
  subTotal: number;
  taxAmount: number;
  grandTotal: number;
  existingInvoiceId?: number;
  paymentStatus: string;
}

export interface PaymentRequest {
  reservationId: number;
  amount: number;
  paymentMode: string;
  transactionRef?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = 'http://localhost:5254/api/billing';

  constructor(private http: HttpClient) { }

  getInvoicePreview(reservationId: number): Observable<InvoiceDetails> {
    return this.http.get<InvoiceDetails>(`${this.apiUrl}/invoice-preview/${reservationId}`);
  }

  processPayment(request: PaymentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/pay`, request);
  }

  getGuestInvoices(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/guest/${userId}`);
  }
}
