import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { LoginRequest, RegisterRequest } from '@ecommerce-mf/session';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface RegisterApiRequest extends RegisterRequest {
  phoneNumber: string;
}

interface StoredAuthUser extends AuthUser {
  passwordDigest: string;
}

export interface AuthApiResponse {
  accessToken: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private users: StoredAuthUser[] = [
    {
      id: 'usr-1001',
      name: 'Demo User',
      email: 'demo@local.dev',
      phoneNumber: '+11234567890',
      passwordDigest: this.createDigest('P@ssword123'),
    },
  ];

  login(request: LoginRequest): Observable<AuthApiResponse> {
    const normalizedEmail = this.normalizeEmail(request.email);
    const passwordDigest = this.createDigest(request.password);
    const user = this.users.find(
      (storedUser) =>
        storedUser.email === normalizedEmail && storedUser.passwordDigest === passwordDigest,
    );

    if (!user) {
      return throwError(() => new Error('INVALID_CREDENTIALS')).pipe(delay(450));
    }

    return of({
      accessToken: this.createAccessToken(user),
      user: this.toPublicUser(user),
    }).pipe(delay(450));
  }

  register(request: RegisterApiRequest): Observable<AuthApiResponse> {
    if (!this.isValidRegisterPayload(request)) {
      return throwError(() => new Error('INVALID_REGISTER_PAYLOAD')).pipe(delay(450));
    }

    const normalizedEmail = this.normalizeEmail(request.email);
    const existingUser = this.users.some((storedUser) => storedUser.email === normalizedEmail);

    if (existingUser) {
      return throwError(() => new Error('EMAIL_IN_USE')).pipe(delay(450));
    }

    const nextUser: StoredAuthUser = {
      id: `usr-${Date.now()}`,
      name: request.name.trim(),
      email: normalizedEmail,
      phoneNumber: request.phoneNumber.trim(),
      passwordDigest: this.createDigest(request.password),
    };

    this.users = [...this.users, nextUser];

    return of({
      accessToken: this.createAccessToken(nextUser),
      user: this.toPublicUser(nextUser),
    }).pipe(delay(450));
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toPublicUser(user: StoredAuthUser): AuthUser {
    const { passwordDigest, ...safeUser } = user;
    return safeUser;
  }

  private createAccessToken(user: AuthUser): string {
    return `mock-token-${user.id}-${Date.now()}`;
  }

  private isValidRegisterPayload(request: RegisterApiRequest): boolean {
    const phoneRegex = /^\+?[1-9][0-9]{9,14}$/;
    const hasPasswordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/.test(request.password);

    return (
      request.password === request.confirmPassword &&
      hasPasswordPolicy &&
      phoneRegex.test(request.phoneNumber.trim())
    );
  }

  private createDigest(value: string): string {
    return btoa(encodeURIComponent(value));
  }
}
