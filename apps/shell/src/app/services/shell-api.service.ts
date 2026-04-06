import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface CartApiItem {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ShellApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.ecommerceApiBaseUrl.replace(/\/+$/, '');

  getCartItemCount(): Observable<number> {
    return this.http
      .get<CartApiItem[]>(`${this.apiBaseUrl}/cart`)
      .pipe(map((items) => items.length));
  }
}
