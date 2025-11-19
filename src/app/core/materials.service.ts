import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class MaterialsService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/materials';

  /**
   * Get all materials
   */
  list(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl);
  }

  /**
   * Get a single material by ID
   */
  get(id: string): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new material
   */
  create(material: Omit<Material, 'id'>): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, material);
  }

  /**
   * Update an existing material
   */
  update(id: string, material: Partial<Material>): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}/${id}`, material);
  }

  /**
   * Delete a material
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
