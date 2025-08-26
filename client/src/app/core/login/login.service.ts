// src/app/core/login.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface RegisterUserRequest { name: string; email: string; password: string; }
export interface RegisterUserResponse { id: string; name: string; email: string; createdAt: string; }

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { access_token: string; token_type: string; expires_in: number; }

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http = inject(HttpClient);
  readonly token = signal<string | null>(localStorage.getItem('auth_token'));

  register(dto: RegisterUserRequest): Observable<RegisterUserResponse> {
    return this.http.post<RegisterUserResponse>('/users', dto);
  }

  login(dto: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', dto).pipe(
      tap(r => {
        this.token.set(r.access_token);
        localStorage.setItem('auth_token', r.access_token);
      })
    );
  }

  logout(): void {
    this.token.set(null);
    localStorage.removeItem('auth_token');
  }

  authHeader(): Record<string, string> {
    const t = this.token();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
}
