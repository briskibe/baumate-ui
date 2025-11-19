import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Worker } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class WorkersService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/workers';

  /**
   * Get all workers
   */
  list(): Observable<Worker[]> {
    return this.http.get<Worker[]>(this.apiUrl);
  }

  /**
   * Get a single worker by ID
   */
  get(id: string): Observable<Worker> {
    return this.http.get<Worker>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new worker
   */
  create(worker: Omit<Worker, 'id'>): Observable<Worker> {
    return this.http.post<Worker>(this.apiUrl, worker);
  }

  /**
   * Update an existing worker
   */
  update(id: string, worker: Partial<Worker>): Observable<Worker> {
    return this.http.put<Worker>(`${this.apiUrl}/${id}`, worker);
  }

  /**
   * Delete a worker
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
