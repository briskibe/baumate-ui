import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Site } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class SitesService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/sites';

  /**
   * Get all sites
   */
  list(): Observable<Site[]> {
    return this.http.get<Site[]>(this.apiUrl);
  }

  /**
   * Get a single site by ID
   */
  get(id: string): Observable<Site> {
    return this.http.get<Site>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new site
   */
  create(site: Omit<Site, 'id'>): Observable<Site> {
    return this.http.post<Site>(this.apiUrl, site);
  }

  /**
   * Update an existing site
   */
  update(id: string, site: Partial<Site>): Observable<Site> {
    return this.http.put<Site>(`${this.apiUrl}/${id}`, site);
  }

  /**
   * Delete a site
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
