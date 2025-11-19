import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyLogEntry } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class DailyLogEntriesService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/daily-log-entries';

  /**
   * Get all daily log entries
   */
  list(): Observable<DailyLogEntry[]> {
    return this.http.get<DailyLogEntry[]>(this.apiUrl);
  }

  /**
   * Get a single daily log entry by ID
   */
  get(id: string): Observable<DailyLogEntry> {
    return this.http.get<DailyLogEntry>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new daily log entry
   */
  create(entry: DailyLogEntry): Observable<DailyLogEntry> {
    return this.http.post<DailyLogEntry>(this.apiUrl, entry);
  }

  /**
   * Update an existing daily log entry
   */
  update(id: string, entry: DailyLogEntry): Observable<DailyLogEntry> {
    return this.http.put<DailyLogEntry>(`${this.apiUrl}/${id}`, entry);
  }

  /**
   * Delete a daily log entry
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
