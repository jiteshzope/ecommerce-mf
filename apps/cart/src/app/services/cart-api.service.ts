import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CartApiItem {
  id: number;
  productId: number;
  title: string;
  url: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.ecommerceApiBaseUrl.replace(/\/+$/, '');

  getCartItems(token: string): Observable<CartApiItem[]> {
    return this.http.get<CartApiItem[]>(`${this.apiBaseUrl}/cart`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }
}
