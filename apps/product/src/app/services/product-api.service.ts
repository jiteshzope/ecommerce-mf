import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductApiItem {
  id: number;
  title: string;
  url: string;
  price: number;
}

export interface ProductDetailsApiItem extends ProductApiItem {
  description: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface AddToCartApiResponse {
  id: string;
  productId: string;
  quantity: number;
  title: string;
  url: string;
  price: number;
  removed?: boolean;
}

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
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.ecommerceApiBaseUrl.replace(/\/+$/, '');

  getProducts(): Observable<ProductApiItem[]> {
    return this.http.get<ProductApiItem[]>(`${this.apiBaseUrl}/catalog/products`);
  }

  getProductById(productId: string): Observable<ProductDetailsApiItem> {
    return this.http.get<ProductDetailsApiItem>(`${this.apiBaseUrl}/catalog/products/${productId}`);
  }

  getCartItems(accessToken: string): Observable<CartApiItem[]> {
    return this.http.get<CartApiItem[]>(`${this.apiBaseUrl}/cart`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
      }),
    });
  }

  addToCart(accessToken: string, request: AddToCartRequest): Observable<AddToCartApiResponse> {
    return this.http.post<AddToCartApiResponse>(`${this.apiBaseUrl}/cart/items`, request, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
      }),
    });
  }

  removeFromCart(accessToken: string, request: AddToCartRequest): Observable<AddToCartApiResponse> {
    return this.http.post<AddToCartApiResponse>(`${this.apiBaseUrl}/cart/items/remove`, request, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
      }),
    });
  }
}
