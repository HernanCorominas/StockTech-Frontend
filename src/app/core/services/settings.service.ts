import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
}

export interface UpdateSystemSetting {
  value: string;
  description?: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private api = `${environment.apiUrl}/v1/systemsettings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SystemSetting[]> {
    return this.http.get<SystemSetting[]>(this.api);
  }

  getByKey(key: string): Observable<SystemSetting> {
    return this.http.get<SystemSetting>(`${this.api}/${key}`);
  }

  upsert(key: string, data: UpdateSystemSetting): Observable<SystemSetting> {
    return this.http.put<SystemSetting>(`${this.api}/${key}`, data);
  }
}
