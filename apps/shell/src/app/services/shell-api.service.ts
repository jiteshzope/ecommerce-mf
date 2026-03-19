import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ShellCartApiItem {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ShellApiService {
  private readonly http = inject(HttpClient);

  getCartItemCount(): Observable<number> {
    return this.http
      .get<ShellCartApiItem[]>('https://jsonplaceholder.typicode.com/todos?_limit=6')
      .pipe(map((items) => items.length));
  }
}
