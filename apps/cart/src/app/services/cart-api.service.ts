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

export interface UpdateCartQuantityRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartQuantityResponse {
  id?: number;
  productId: number;
  quantity: number;
  title?: string;
  url?: string;
  price?: number;
  removed?: boolean;
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

  addCartItem(token: string, request: UpdateCartQuantityRequest): Observable<UpdateCartQuantityResponse> {
    return this.http.post<UpdateCartQuantityResponse>(`${this.apiBaseUrl}/cart/items`, request, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }

  removeCartItem(token: string, request: UpdateCartQuantityRequest): Observable<UpdateCartQuantityResponse> {
    return this.http.post<UpdateCartQuantityResponse>(`${this.apiBaseUrl}/cart/items/remove`, request, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }
}
