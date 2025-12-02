import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-site-overview-tab',
  standalone: true,
  imports: [CommonModule, HlmButtonImports],
  template: `
    <div class="space-y-4">
      <!-- Site Information Card -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">Site Information</h3>
          @if (canEdit && !isEditMode) {
            <button hlmBtn variant="ghost" size="sm" (click)="enterEditMode?.()">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          }
        </div>
        <div class="px-4 py-4">
          @if (!isEditMode) {
            <div class="space-y-3">
              <div class="flex items-start">
                <div class="w-32 flex-shrink-0">
                  <span class="text-sm font-medium text-gray-500">Site Name</span>
                </div>
                <div class="flex-1">
                  <span class="text-sm text-gray-900">{{ site?.name }}</span>
                </div>
              </div>
              <div class="flex items-start">
                <div class="w-32 flex-shrink-0">
                  <span class="text-sm font-medium text-gray-500">Status</span>
                </div>
                <div class="flex-1">
                  @if (site?.status) {
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="{
                        'bg-blue-100 text-blue-800': site?.status === 'planning',
                        'bg-green-100 text-green-800': site?.status === 'active',
                        'bg-yellow-100 text-yellow-800': site?.status === 'on_hold',
                        'bg-gray-100 text-gray-800': site?.status === 'completed'
                      }"
                    >
                      {{ formatStatus?.(site!.status) }}
                    </span>
                  } @else {
                    <span class="text-sm text-gray-400">Not set</span>
                  }
                </div>
              </div>
            </div>
          } @else {
            <!-- Edit Mode Form -->
            <div class="space-y-4">
              @if (siteEditError) {
                <div class="rounded-md bg-red-50 p-3">
                  <p class="text-sm text-red-800">{{ siteEditError }}</p>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Site Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [value]="siteForm?.name"
                  (input)="updateSiteName?.($any($event.target).value)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Status <span class="text-red-500">*</span>
                </label>
                <select
                  [value]="siteForm?.status"
                  (change)="updateSiteStatus?.($any($event.target).value)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  [value]="siteForm?.address"
                  (input)="updateSiteAddress?.($any($event.target).value)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  [value]="siteForm?.city"
                  (input)="updateSiteCity?.($any($event.target).value)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter city"
                />
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Client & Project Manager Card -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">Client & Management</h3>
          @if (canEdit && !isEditMode) {
            <button hlmBtn variant="ghost" size="sm" (click)="enterEditMode?.()">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          }
        </div>
        <div class="px-4 py-4">
          @if (!isEditMode) {
            <div class="space-y-3">
              <div class="flex items-start">
                <div class="w-32 flex-shrink-0">
                  <span class="text-sm font-medium text-gray-500">Client</span>
                </div>
                <div class="flex-1">
                  @if (siteClient) {
                    <div>
                      <div class="text-sm text-gray-900">{{ siteClient?.name }}</div>
                      @if (siteClient?.company) {
                        <div class="text-xs text-gray-500 mt-0.5">{{ siteClient?.company }}</div>
                      }
                    </div>
                  } @else {
                    <span class="text-sm text-gray-400">Not assigned</span>
                  }
                </div>
              </div>
              <div class="flex items-start">
                <div class="w-32 flex-shrink-0">
                  <span class="text-sm font-medium text-gray-500">Project Manager</span>
                </div>
                <div class="flex-1">
                  @if (projectManager) {
                    <div>
                      <div class="text-sm text-gray-900">{{ projectManager?.name }}</div>
                      @if (projectManager?.email) {
                        <div class="text-xs text-gray-500 mt-0.5">{{ projectManager?.email }}</div>
                      }
                    </div>
                  } @else {
                    <span class="text-sm text-gray-400">Not assigned</span>
                  }
                </div>
              </div>
              <div class="flex items-start">
                <div class="w-32 flex-shrink-0">
                  <span class="text-sm font-medium text-gray-500">Start Date</span>
                </div>
                <div class="flex-1">
                  @if (site?.startDate) {
                    <span class="text-sm text-gray-900">{{ site?.startDate }}</span>
                  } @else {
                    <span class="text-sm text-gray-400">Not set</span>
                  }
                </div>
              </div>
              <div class="flex items-start">
                <div class="w-32 flex-shrink-0">
                  <span class="text-sm font-medium text-gray-500">End Date</span>
                </div>
                <div class="flex-1">
                  @if (site?.endDate) {
                    <span class="text-sm text-gray-900">{{ site?.endDate }}</span>
                  } @else {
                    <span class="text-sm text-gray-400">Not set</span>
                  }
                </div>
              </div>
            </div>
          } @else {
            <!-- Edit Mode Form -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <select
                  [value]="siteForm?.clientId"
                  (change)="updateSiteClient?.($any($event.target).value)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- No client --</option>
                  @for (client of clients; track client.id) {
                    <option [value]="client.id">{{ client.name }}@if (client.company) { ({{ client.company }}) }</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  [value]="siteForm?.startDate"
                  (input)="updateSiteStartDate?.($any($event.target).value)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  [value]="siteForm?.endDate"
                  (input)="updateSiteEndDate?.($any($event.target).value)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p class="text-xs text-gray-500 italic">Note: Project Manager is assigned through the Assignments tab</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class SiteOverviewTabComponent {
  @Input() canEdit = false;
  @Input() isEditMode = false;
  @Input() site: any = null;
  @Input() siteForm: any = null;
  @Input() siteEditError: string | null = null;
  @Input() siteClient: any = null;
  @Input() projectManager: any = null;
  @Input() clients: any[] = [];

  @Input() formatStatus: ((status: string) => string) | null = null;

  // Actions as function inputs
  @Input() enterEditMode: (() => void) | null = null;
  @Input() updateSiteName: ((name: string) => void) | null = null;
  @Input() updateSiteAddress: ((address: string) => void) | null = null;
  @Input() updateSiteCity: ((city: string) => void) | null = null;
  @Input() updateSiteStatus: ((status: string) => void) | null = null;
  @Input() updateSiteClient: ((clientId: string) => void) | null = null;
  @Input() updateSiteStartDate: ((date: string) => void) | null = null;
  @Input() updateSiteEndDate: ((date: string) => void) | null = null;
}
