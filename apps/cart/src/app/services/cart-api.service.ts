import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartApiItem {
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly http = inject(HttpClient);

  getCartItems(): Observable<CartApiItem[]> {
    return this.http.get<CartApiItem[]>(
      'https://jsonplaceholder.typicode.com/todos?_limit=6',
    );
  }
}
