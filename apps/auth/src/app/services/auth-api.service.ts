import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthApiUser {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<AuthApiUser[]> {
    return this.http.get<AuthApiUser[]>(
      'https://jsonplaceholder.typicode.com/users?_limit=4',
    );
  }
}
