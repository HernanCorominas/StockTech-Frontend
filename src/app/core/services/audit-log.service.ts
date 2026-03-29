import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLog, PagedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private api = `${environment.apiUrl}/v1/AuditLogs`;
  private http = inject(HttpClient);

  getLogs(page: number, pageSize: number, filters: any): Observable<PagedResult<AuditLog>> {
    const params: any = { page, pageSize };
    if (filters.entityName) params.entityName = filters.entityName;
    if (filters.action) params.action = filters.action;
    if (filters.start) params.start = filters.start;
    if (filters.end) params.end = filters.end;
    
    return this.http.get<PagedResult<AuditLog>>(this.api, { params });
  }

  getRecent(count: number = 50): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.api}/recent?count=${count}`);
  }
}
