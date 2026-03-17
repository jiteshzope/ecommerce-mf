import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShellDashboardItem {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class ShellApiService {
  private readonly http = inject(HttpClient);

  getDashboardData(): Observable<ShellDashboardItem[]> {
    return this.http.get<ShellDashboardItem[]>(
      'https://jsonplaceholder.typicode.com/users?_limit=5',
    );
  }
}
