import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-site-daily-log-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmButtonImports],
  template: `
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div class="px-6 py-5 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Daily Log</h2>
          <div class="flex items-center space-x-3">
            <input
              type="date"
              [ngModel]="selectedDate"
              (ngModelChange)="dateChange.emit($event)"
              class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        @if (dailyLogSuccess) {
          <div class="mb-4 rounded-md bg-green-50 p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <p class="ml-3 text-sm font-medium text-green-800">{{ dailyLogSuccess }}</p>
            </div>
          </div>
        }

        @if (dailyLogError) {
          <div class="mb-4 rounded-md bg-red-50 p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="ml-3 text-sm font-medium text-red-800">{{ dailyLogError }}</p>
            </div>
          </div>
        }

        @if (!canEditDailyLogTab && !canEditGeneral) {
          <div class="mb-4 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-yellow-800">View-only: ask your Org Admin for access</p>
                <p class="text-sm text-yellow-700 mt-1">
                  You can only edit daily logs if you are an Organization Admin or assigned as a site manager for this site.
                </p>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="px-6 py-5">
        @if (!currentDailyLog) {
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No log for this date</h3>
            <p class="mt-1 text-sm text-gray-500">Create a daily log to start tracking work entries.</p>
            @if (canEditDailyLogForSelectedDate) {
              <div class="mt-6">
                <button
                  hlmBtn
                  variant="default"
                  (click)="createTodaysLogRequested.emit()"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Today's Log
                </button>
              </div>
            } @else {
              <p class="mt-4 text-sm text-yellow-700">You can create a daily log only for today's date.</p>
            }
          </div>
        } @else {
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Work Entries</h3>
            @if (canEditDailyLogForSelectedDate) {
              <button
                hlmBtn
                variant="default"
                size="sm"
                (click)="addEntryRequested.emit()"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Entry
              </button>
            }
          </div>

          @if (!currentDailyLogEntries || currentDailyLogEntries.length === 0) {
            <p class="text-sm text-gray-500 text-center py-8">No entries for this log yet</p>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Break (min)</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    @if (canEditDailyLogForSelectedDate) {
                      <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    }
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (entry of currentDailyLogEntries; track entry.id) {
                    <tr>
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {{ getWorkerById?.(entry.workerId)?.name || 'Unknown' }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ entry.startTime }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ entry.endTime }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ entry.breakMinutes }}</td>
                      <td class="px-4 py-3 text-sm text-gray-500">{{ entry.notes || '-' }}</td>
                      @if (canEditDailyLogForSelectedDate) {
                        <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button (click)="editEntryRequested.emit(entry)" class="text-blue-600 hover:text-blue-900">Edit</button>
                          <button (click)="deleteEntryRequested.emit(entry)" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class SiteDailyLogTabComponent {
  @Input() canEditGeneral = false;
  @Input() canEditDailyLogTab = false;
  @Input() canEditDailyLogForSelectedDate = false;

  @Input() selectedDate: string = '';

  @Input() dailyLogSuccess: string | null = null;
  @Input() dailyLogError: string | null = null;

  @Input() currentDailyLog: any = null;
  @Input() currentDailyLogEntries: any[] = [];

  @Input() getWorkerById: ((id: string) => any) | null = null;

  @Output() dateChange = new EventEmitter<string>();
  @Output() createTodaysLogRequested = new EventEmitter<void>();
  @Output() addEntryRequested = new EventEmitter<void>();
  @Output() editEntryRequested = new EventEmitter<any>();
  @Output() deleteEntryRequested = new EventEmitter<any>();
}
