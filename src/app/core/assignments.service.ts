import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SiteAssignment } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class AssignmentsService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/assignments';

  /**
   * Get all assignments
   */
  list(): Observable<SiteAssignment[]> {
    return this.http.get<SiteAssignment[]>(this.apiUrl);
  }

  /**
   * Get a single assignment by ID
   */
  get(id: string): Observable<SiteAssignment> {
    return this.http.get<SiteAssignment>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new assignment
   */
  create(assignment: SiteAssignment): Observable<SiteAssignment> {
    return this.http.post<SiteAssignment>(this.apiUrl, assignment);
  }

  /**
   * Update an existing assignment
   */
  update(id: string, assignment: Partial<SiteAssignment>): Observable<SiteAssignment> {
    return this.http.put<SiteAssignment>(`${this.apiUrl}/${id}`, assignment);
  }

  /**
   * Delete an assignment
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
