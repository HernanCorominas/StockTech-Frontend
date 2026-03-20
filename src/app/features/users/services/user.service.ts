import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface UserDto {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleId: string;
  role: { name: string };
  isActive: boolean;
}

export interface RoleDto {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  users = signal<UserDto[]>([]);
  loading = signal(false);

  getAll(): Observable<UserDto[]> {
    this.loading.set(true);
    return this.http.get<UserDto[]>(this.apiUrl).pipe(
      tap(users => {
        this.users.set(users);
        this.loading.set(false);
      })
    );
  }

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${environment.apiUrl}/api/v1/roles`);
  }

  create(user: any): Observable<UserDto> {
    return this.http.post<UserDto>(this.apiUrl, user).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  update(id: string, user: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, user).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getAll().subscribe())
    );
  }
}
