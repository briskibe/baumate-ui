import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-site-materials-tab',
  standalone: true,
  imports: [CommonModule, HlmButtonImports],
  template: `
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Site Materials</h2>
          <p class="mt-1 text-sm text-gray-600">Track material usage and quantities</p>
        </div>
        <div class="text-right">
          @if (canEdit) {
            <button hlmBtn variant="default" size="sm" (click)="addMaterialRequested.emit()">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Material
            </button>
          } @else {
            <button hlmBtn variant="outline" size="sm" [disabled]="true">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Material
            </button>
            <p class="text-xs text-gray-500 mt-1">View-only: ask your Org Admin for access</p>
          }
        </div>
      </div>
      <div class="px-6 py-5">
        @if (!siteMaterials || siteMaterials.length === 0) {
          <p class="text-sm text-gray-500 text-center py-8">No materials assigned to this site</p>
        } @else {
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned Qty</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Qty</th>
                  @if (canEdit) {
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  }
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (siteMaterial of siteMaterials; track siteMaterial.id) {
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ getMaterialById?.(siteMaterial.materialId)?.name || 'Unknown' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ siteMaterial.plannedQty || '-' }} {{ getMaterialById?.(siteMaterial.materialId)?.unit }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ siteMaterial.actualQty || '-' }} {{ getMaterialById?.(siteMaterial.materialId)?.unit }}
                    </td>
                    @if (canEdit) {
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button hlmBtn variant="ghost" size="sm" (click)="removeMaterialRequested.emit(siteMaterial)">Remove</button>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class SiteMaterialsTabComponent {
  @Input() canEdit = false;
  @Input() siteMaterials: any[] = [];
  @Input() getMaterialById: ((id: string) => any) | null = null;

  @Output() addMaterialRequested = new EventEmitter<void>();
  @Output() removeMaterialRequested = new EventEmitter<any>();
}
