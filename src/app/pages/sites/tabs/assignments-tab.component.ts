import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-site-assignments-tab',
  standalone: true,
  imports: [CommonModule, HlmButtonImports],
  template: `
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Site Assignments</h2>
          <p class="mt-1 text-sm text-gray-600">Manage worker assignments and roles</p>
        </div>
        <div class="text-right">
          @if (canEdit) {
            <button hlmBtn variant="default" size="sm" (click)="addAssignmentRequested.emit()">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Assignment
            </button>
          } @else {
            <button hlmBtn variant="outline" size="sm" [disabled]="true">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Assignment
            </button>
            <p class="text-xs text-gray-500 mt-1">View-only: ask your Org Admin for access</p>
          }
        </div>
      </div>
      <div class="px-6 py-5">
        @if (!siteAssignments || siteAssignments.length === 0) {
          <p class="text-sm text-gray-500 text-center py-8">No assignments for this site</p>
        } @else {
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  @if (canEdit) {
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  }
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (assignment of siteAssignments; track assignment.id) {
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ getWorkerById?.(assignment.workerId)?.name || 'Unknown' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-purple-100 text-purple-800': assignment.role === 'site_manager',
                          'bg-blue-100 text-blue-800': assignment.role === 'worker'
                        }"
                      >
                        {{ assignment.role === 'site_manager' ? 'Site Manager' : 'Worker' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ assignment.startDate || assignment.assignedDate || '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ assignment.endDate || '-' }}
                    </td>
                    @if (canEdit) {
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button hlmBtn variant="ghost" size="sm" (click)="removeAssignmentRequested.emit(assignment)">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
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
export class SiteAssignmentsTabComponent {
  @Input() canEdit = false;
  @Input() siteAssignments: any[] = [];
  @Input() getWorkerById: ((id: string) => any) | null = null;

  @Output() addAssignmentRequested = new EventEmitter<void>();
  @Output() removeAssignmentRequested = new EventEmitter<any>();
}
