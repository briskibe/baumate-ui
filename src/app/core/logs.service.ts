import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyLog } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/daily-logs';

  /**
   * Get all daily logs
   */
  list(): Observable<DailyLog[]> {
    return this.http.get<DailyLog[]>(this.apiUrl);
  }

  /**
   * Get a single daily log by ID
   */
  get(id: string): Observable<DailyLog> {
    return this.http.get<DailyLog>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new daily log
   */
  create(log: Omit<DailyLog, 'id'>): Observable<DailyLog> {
    return this.http.post<DailyLog>(this.apiUrl, log);
  }

  /**
   * Update an existing daily log
   */
  update(id: string, log: Partial<DailyLog>): Observable<DailyLog> {
    return this.http.put<DailyLog>(`${this.apiUrl}/${id}`, log);
  }

  /**
   * Delete a daily log
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
