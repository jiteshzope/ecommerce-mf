import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductApiItem {
  id: number;
  title: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);

  getProducts(): Observable<ProductApiItem[]> {
    return this.http.get<ProductApiItem[]>(
      'https://jsonplaceholder.typicode.com/photos?_limit=6',
    );
  }
}
