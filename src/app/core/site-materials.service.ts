import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SiteMaterial } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class SiteMaterialsService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/site-materials';

  /**
   * Get all site materials
   */
  list(): Observable<SiteMaterial[]> {
    return this.http.get<SiteMaterial[]>(this.apiUrl);
  }

  /**
   * Get a single site material by ID
   */
  get(id: string): Observable<SiteMaterial> {
    return this.http.get<SiteMaterial>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new site material
   */
  create(siteMaterial: SiteMaterial): Observable<SiteMaterial> {
    return this.http.post<SiteMaterial>(this.apiUrl, siteMaterial);
  }

  /**
   * Update an existing site material
   */
  update(id: string, siteMaterial: Partial<SiteMaterial>): Observable<SiteMaterial> {
    return this.http.put<SiteMaterial>(`${this.apiUrl}/${id}`, siteMaterial);
  }

  /**
   * Delete a site material
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
