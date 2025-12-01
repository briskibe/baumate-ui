import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  Site,
  Worker,
  Material,
  SiteAssignment,
  SiteMaterial,
  DailyLog,
  DailyLogEntry,
  Client,
  User
} from '../../../core/models';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthService, canEditDailyLog, isSiteManager } from '../../core/auth.service';
import { SitesService } from '../../core/sites.service';
import { WorkersService } from '../../core/workers.service';
import { MaterialsService } from '../../core/materials.service';
import { AssignmentsService } from '../../core/assignments.service';
import { SiteMaterialsService } from '../../core/site-materials.service';
import { LogsService } from '../../core/logs.service';
import { DailyLogEntriesService } from '../../core/daily-log-entries.service';
import { ClientsService } from '../../core/clients.service';
import { UsersService } from '../../core/users.service';
import { forkJoin } from 'rxjs';
import { toast } from 'ngx-sonner';
import { TranslocoModule } from '@jsverse/transloco';
import { SiteOverviewTabComponent } from './tabs/overview-tab.component';
import { SiteWorkersTabComponent } from './tabs/workers-tab.component';
import { SiteMaterialsTabComponent } from './tabs/materials-tab.component';
import { SiteAssignmentsTabComponent } from './tabs/assignments-tab.component';
import { SiteDailyLogTabComponent } from './tabs/daily-log-tab.component';

type TabType = 'overview' | 'workers' | 'materials' | 'assignments' | 'dailyLog';

@Component({
  selector: 'app-site-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HlmButtonImports, TranslocoModule, SiteOverviewTabComponent, SiteWorkersTabComponent, SiteMaterialsTabComponent, SiteAssignmentsTabComponent, SiteDailyLogTabComponent],
  templateUrl: './site-detail.component.html',
  styleUrl: './site-detail.component.css'
})
export class SiteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private sitesService = inject(SitesService);
  private workersService = inject(WorkersService);
  private materialsService = inject(MaterialsService);
  private assignmentsService = inject(AssignmentsService);
  private siteMaterialsService = inject(SiteMaterialsService);
  private logsService = inject(LogsService);
  private dailyLogEntriesService = inject(DailyLogEntriesService);
  private clientsService = inject(ClientsService);
  private usersService = inject(UsersService);

  site = signal<Site | null>(null);
  workers = signal<Worker[]>([]);
  materials = signal<Material[]>([]);
  assignments = signal<SiteAssignment[]>([]);
  siteAssignments = signal<SiteAssignment[]>([]);
  siteMaterials = signal<SiteMaterial[]>([]);
  dailyLogs = signal<DailyLog[]>([]);
  dailyLogEntries = signal<DailyLogEntry[]>([]);
  clients = signal<Client[]>([]);
  users = signal<User[]>([]);

  loading = signal(true);
  error = signal('');
  activeTab = signal<TabType>('overview');

  user = computed(() => this.authService.user);

  // Permission checks
  canEditGeneral = computed(() => {
    const currentUser = this.user();
    return currentUser?.role === 'org_admin';
  });

  canEditDailyLogTab = computed(() => {
    const currentUser = this.user();
    const currentSite = this.site();
    const currentAssignments = this.siteAssignments();
    if (!currentUser || !currentSite) return false;
    return canEditDailyLog(currentUser, currentSite, currentAssignments);
  });

  // Only allow site managers (org_manager) to edit/create on today's date; admins/org_admins can edit any date
  isSelectedDateToday = computed(() => {
    const selected = this.selectedDate();
    if (!selected) return false;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    return selected === todayStr;
  });

  canEditDailyLogForSelectedDate = computed(() => {
    const user = this.user();
    if (!this.canEditDailyLogTab()) return false;
    if (!user) return false;
    if (user.role === 'org_manager') {
      return this.isSelectedDateToday();
    }
    // admin and org_admin keep full access
    return true;
  });

  isSiteManagerFlag = computed(() => {
    const currentUser = this.user();
    const currentSite = this.site();
    const currentAssignments = this.siteAssignments();
    if (!currentUser || !currentSite) return false;
    return isSiteManager(currentUser, currentSite, currentAssignments);
  });

  // Data helpers for Overview tab
  siteClient = computed(() => {
    const currentSite = this.site();
    const allClients = this.clients();
    if (!currentSite?.clientId) return null;
    return allClients.find(c => c.id === currentSite.clientId);
  });

  projectManager = computed(() => {
    const currentAssignments = this.siteAssignments();
    const allWorkers = this.workers();
    const managerAssignment = currentAssignments.find(a => a.role === 'site_manager');
    if (!managerAssignment) return null;
    return allWorkers.find(w => w.id === managerAssignment.workerId);
  });

  // Get IDs of workers assigned to this site
  assignedWorkerIds = computed(() => {
    const currentAssignments = this.siteAssignments();
    return new Set(currentAssignments.map(a => a.workerId));
  });

  // Check if a worker is assigned to this site
  isWorkerAssigned(workerId: string): boolean {
    return this.assignedWorkerIds().has(workerId);
  }

  // Dialog state
  showAddAssignmentDialog = signal(false);
  showRemoveAssignmentDialog = signal(false);
  assignmentToRemove = signal<SiteAssignment | null>(null);

  // Form data for add assignment
  newAssignment = signal({
    workerId: '',
    role: 'worker' as 'site_manager' | 'worker',
    startDate: '',
    endDate: ''
  });

  // Validation and error states
  assignmentError = signal('');
  assignmentSuccess = signal('');

  // Material dialog state
  showAddMaterialDialog = signal(false);
  showRemoveMaterialDialog = signal(false);
  materialToRemove = signal<SiteMaterial | null>(null);

  // Form data for add material
  newMaterial = signal({
    materialId: '',
    plannedQty: undefined as number | undefined,
    actualQty: undefined as number | undefined
  });

  // Material validation and error states
  materialError = signal('');
  materialSuccess = signal('');

  // Daily Log state
  selectedDate = signal('');
  currentDailyLog = signal<DailyLog | null>(null);
  currentDailyLogEntries = signal<DailyLogEntry[]>([]);

  // Daily Log dialog state
  showAddEntryDialog = signal(false);
  showEditEntryDialog = signal(false);
  showDeleteEntryDialog = signal(false);
  entryToEdit = signal<DailyLogEntry | null>(null);
  entryToDelete = signal<DailyLogEntry | null>(null);

  // Form data for add/edit entry
  entryForm = signal({
    workerId: '',
    startTime: '',
    endTime: '',
    breakMinutes: 0,
    notes: ''
  });

  // Daily Log validation and success states
  dailyLogError = signal('');
  dailyLogSuccess = signal('');

  // Site edit state
  isEditMode = signal(false);
  siteForm = signal({
    name: '',
    address: '',
    city: '',
    status: 'planning' as 'planning' | 'active' | 'on_hold' | 'completed',
    startDate: '',
    endDate: '',
    clientId: ''
  });
  siteEditError = signal('');

  // Calculate total man-hours for current log entries
  totalManHours = computed(() => {
    const entries = this.currentDailyLogEntries();
    return entries.reduce((total, entry) => {
      const start = this.parseTime(entry.startTime);
      const end = this.parseTime(entry.endTime);
      if (start && end) {
        const totalMinutes = (end.hours * 60 + end.minutes) - (start.hours * 60 + start.minutes);
        const workMinutes = totalMinutes - entry.breakMinutes;
        return total + (workMinutes / 60);
      }
      return total;
    }, 0);
  });

  // Get IDs of materials already assigned to this site
  assignedMaterialIds = computed(() => {
    const currentSiteMaterials = this.siteMaterials();
    return new Set(currentSiteMaterials.map(sm => sm.materialId));
  });

  // Check if a material is already assigned to this site
  isMaterialAssigned(materialId: string): boolean {
    return this.assignedMaterialIds().has(materialId);
  }

  ngOnInit() {
    // Set default date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.selectedDate.set(`${year}-${month}-${day}`);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSiteData(id);
    }
  }

  loadSiteData(id: string) {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      site: this.sitesService.get(id),
      workers: this.workersService.list(),
      materials: this.materialsService.list(),
      assignments: this.assignmentsService.list(),
      siteMaterials: this.siteMaterialsService.list(),
      dailyLogs: this.logsService.list(),
      dailyLogEntries: this.dailyLogEntriesService.list(),
      clients: this.clientsService.list(),
      users: this.usersService.list()
    }).subscribe({
      next: (data) => {
        this.site.set(data.site);
        this.workers.set(data.workers);
        this.materials.set(data.materials);
        this.assignments.set(data.assignments);
        this.clients.set(data.clients);
        this.users.set(data.users);

        // Filter site-specific data
        this.siteAssignments.set(data.assignments.filter(a => a.siteId === id));
        this.siteMaterials.set(data.siteMaterials.filter(sm => sm.siteId === id));
        this.dailyLogs.set(data.dailyLogs.filter(dl => dl.siteId === id));
        this.dailyLogEntries.set(data.dailyLogEntries);

        // Update current daily log for selected date
        this.updateCurrentDailyLog();

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load site details');
        this.loading.set(false);
        toast.error('Failed to load site details', {
          description: 'Unable to load site information. Please try again.'
        });
        console.error('Error loading site:', err);
      }
    });
  }

  setActiveTab(tab: TabType) {
    this.activeTab.set(tab);
  }

  getWorkerById(workerId: string): Worker | undefined {
    return this.workers().find(w => w.id === workerId);
  }

  getMaterialById(materialId: string): Material | undefined {
    return this.materials().find(m => m.id === materialId);
  }

  formatStatus(status?: string): string {
    if (!status) return '';
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  // Site edit methods
  enterEditMode() {
    const currentSite = this.site();
    if (!currentSite) return;

    this.siteForm.set({
      name: currentSite.name,
      address: currentSite.address,
      city: currentSite.city || '',
      status: currentSite.status || 'planning',
      startDate: currentSite.startDate || '',
      endDate: currentSite.endDate || '',
      clientId: currentSite.clientId || ''
    });
    this.siteEditError.set('');
    this.isEditMode.set(true);
  }

  cancelEditMode() {
    this.isEditMode.set(false);
    this.siteEditError.set('');
  }

  updateSiteName(name: string) {
    this.siteForm.set({ ...this.siteForm(), name });
  }

  updateSiteAddress(address: string) {
    this.siteForm.set({ ...this.siteForm(), address });
  }

  updateSiteCity(city: string) {
    this.siteForm.set({ ...this.siteForm(), city });
  }

  updateSiteStatus(status: 'planning' | 'active' | 'on_hold' | 'completed') {
    this.siteForm.set({ ...this.siteForm(), status });
  }

  updateSiteStartDate(startDate: string) {
    this.siteForm.set({ ...this.siteForm(), startDate });
  }

  updateSiteEndDate(endDate: string) {
    this.siteForm.set({ ...this.siteForm(), endDate });
  }

  updateSiteClient(clientId: string) {
    this.siteForm.set({ ...this.siteForm(), clientId });
  }

  validateSiteForm(): string | null {
    const form = this.siteForm();

    if (!form.name.trim()) {
      return 'Site name is required';
    }

    if (!form.address.trim()) {
      return 'Address is required';
    }

    if (form.endDate && form.startDate && form.startDate > form.endDate) {
      return 'End date must be after start date';
    }

    return null;
  }

  saveSiteChanges() {
    const validationError = this.validateSiteForm();
    if (validationError) {
      this.siteEditError.set(validationError);
      return;
    }

    const currentSite = this.site();
    if (!currentSite) return;

    const form = this.siteForm();
    const updatedSite: Partial<Site> = {
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim() || undefined,
      status: form.status,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      clientId: form.clientId || undefined
    };

    this.sitesService.update(currentSite.id, updatedSite).subscribe({
      next: (updated) => {
        this.site.set(updated);
        this.isEditMode.set(false);
        this.siteEditError.set('');
        toast.success('Site updated', {
          description: 'Site information has been successfully updated.'
        });
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to update site. Please try again.';
        this.siteEditError.set(message);
        toast.error('Failed to update site', {
          description: message
        });
        console.error('Error updating site:', err);
      }
    });
  }

  // Helper methods to update form fields
  updateWorker(workerId: string) {
    this.newAssignment.set({ ...this.newAssignment(), workerId });
  }

  updateRole(role: 'site_manager' | 'worker') {
    this.newAssignment.set({ ...this.newAssignment(), role });
  }

  updateStartDate(startDate: string) {
    this.newAssignment.set({ ...this.newAssignment(), startDate });
  }

  updateEndDate(endDate: string) {
    this.newAssignment.set({ ...this.newAssignment(), endDate });
  }

  // Open add assignment dialog
  openAddAssignmentDialog() {
    this.newAssignment.set({
      workerId: '',
      role: 'worker',
      startDate: '',
      endDate: ''
    });
    this.assignmentError.set('');
    this.assignmentSuccess.set('');
    this.showAddAssignmentDialog.set(true);
  }

  // Close add assignment dialog
  closeAddAssignmentDialog() {
    this.showAddAssignmentDialog.set(false);
    this.newAssignment.set({
      workerId: '',
      role: 'worker',
      startDate: '',
      endDate: ''
    });
    this.assignmentError.set('');
    this.assignmentSuccess.set('');
  }

  // Validate assignment form
  validateAssignment(): string | null {
    const assignment = this.newAssignment();

    if (!assignment.workerId) {
      return 'Please select a worker';
    }

    if (!assignment.startDate) {
      return 'Please enter a start date';
    }

    // Check if worker is already assigned
    const existingAssignment = this.siteAssignments().find(
      a => a.workerId === assignment.workerId
    );
    if (existingAssignment) {
      return 'This worker is already assigned to this site';
    }

    // Validate end date is after start date
    if (assignment.endDate && assignment.startDate > assignment.endDate) {
      return 'End date must be after start date';
    }

    return null;
  }

  // Submit new assignment
  submitAddAssignment() {
    const validationError = this.validateAssignment();
    if (validationError) {
      this.assignmentError.set(validationError);
      return;
    }

    const currentSite = this.site();
    if (!currentSite) return;

    const assignment = this.newAssignment();
    const newAssignment: SiteAssignment = {
      id: this.generateId(),
      siteId: currentSite.id,
      workerId: assignment.workerId,
      role: assignment.role,
      assignedDate: new Date().toISOString().split('T')[0],
      startDate: assignment.startDate,
      endDate: assignment.endDate || undefined
    };

    this.assignmentsService.create(newAssignment).subscribe({
      next: (created) => {
        // Update local state
        this.siteAssignments.update(assignments => [...assignments, created]);
        this.assignments.update(assignments => [...assignments, created]);

        toast.success('Assignment added', {
          description: 'Worker has been successfully assigned to this site.'
        });
        this.closeAddAssignmentDialog();
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to add assignment. Please try again.';
        this.assignmentError.set(message);
        toast.error('Failed to add assignment', {
          description: message
        });
        console.error('Error adding assignment:', err);
      }
    });
  }

  // Open remove assignment dialog
  openRemoveAssignmentDialog(assignment: SiteAssignment) {
    this.assignmentToRemove.set(assignment);
    this.assignmentError.set('');
    this.showRemoveAssignmentDialog.set(true);
  }

  // Close remove assignment dialog
  closeRemoveAssignmentDialog() {
    this.showRemoveAssignmentDialog.set(false);
    this.assignmentToRemove.set(null);
    this.assignmentError.set('');
  }

  // Confirm and remove assignment
  confirmRemoveAssignment() {
    const assignment = this.assignmentToRemove();
    if (!assignment) return;

    this.assignmentsService.delete(assignment.id).subscribe({
      next: () => {
        // Update local state
        this.siteAssignments.update(assignments =>
          assignments.filter(a => a.id !== assignment.id)
        );
        this.assignments.update(assignments =>
          assignments.filter(a => a.id !== assignment.id)
        );

        toast.success('Assignment removed', {
          description: 'Worker has been unassigned from this site.'
        });
        this.closeRemoveAssignmentDialog();
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to remove assignment. Please try again.';
        this.assignmentError.set(message);
        toast.error('Failed to remove assignment', {
          description: message
        });
        console.error('Error removing assignment:', err);
      }
    });
  }

  // Material helper methods to update form fields
  updateMaterialId(materialId: string) {
    this.newMaterial.update(m => ({ ...m, materialId }));
  }

  updatePlannedQty(qty: string) {
    const parsed = parseFloat(qty);
    this.newMaterial.update(m => ({ ...m, plannedQty: isNaN(parsed) ? undefined : parsed }));
  }

  updateActualQty(qty: string) {
    const parsed = parseFloat(qty);
    this.newMaterial.update(m => ({ ...m, actualQty: isNaN(parsed) ? undefined : parsed }));
  }

  // Open add material dialog
  openAddMaterialDialog() {
    this.newMaterial.set({
      materialId: '',
      plannedQty: undefined,
      actualQty: undefined
    });
    this.materialError.set('');
    this.materialSuccess.set('');
    this.showAddMaterialDialog.set(true);
  }

  // Close add material dialog
  closeAddMaterialDialog() {
    this.showAddMaterialDialog.set(false);
    this.newMaterial.set({
      materialId: '',
      plannedQty: undefined,
      actualQty: undefined
    });
    this.materialError.set('');
    this.materialSuccess.set('');
  }

  // Validate material form
  validateMaterial(): string | null {
    const material = this.newMaterial();

    if (!material.materialId) {
      return 'Please select a material';
    }

    // Check if material is already assigned
    if (this.isMaterialAssigned(material.materialId)) {
      return 'This material is already assigned to this site';
    }

    return null;
  }

  // Submit new material
  submitAddMaterial() {
    const validationError = this.validateMaterial();
    if (validationError) {
      this.materialError.set(validationError);
      return;
    }

    const currentSite = this.site();
    if (!currentSite) return;

    const material = this.newMaterial();
    const newSiteMaterial: SiteMaterial = {
      id: this.generateId(),
      siteId: currentSite.id,
      materialId: material.materialId,
      plannedQty: material.plannedQty,
      actualQty: material.actualQty
    };

    this.siteMaterialsService.create(newSiteMaterial).subscribe({
      next: (created) => {
        // Update local state
        this.siteMaterials.update(materials => [...materials, created]);

        toast.success('Material added', {
          description: 'Material has been successfully added to this site.'
        });
        this.closeAddMaterialDialog();
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to add material. Please try again.';
        this.materialError.set(message);
        toast.error('Failed to add material', {
          description: message
        });
        console.error('Error adding material:', err);
      }
    });
  }

  // Open remove material dialog
  openRemoveMaterialDialog(siteMaterial: SiteMaterial) {
    this.materialToRemove.set(siteMaterial);
    this.materialError.set('');
    this.showRemoveMaterialDialog.set(true);
  }

  // Close remove material dialog
  closeRemoveMaterialDialog() {
    this.showRemoveMaterialDialog.set(false);
    this.materialToRemove.set(null);
    this.materialError.set('');
  }

  // Confirm and remove material
  confirmRemoveMaterial() {
    const siteMaterial = this.materialToRemove();
    if (!siteMaterial) return;

    this.siteMaterialsService.delete(siteMaterial.id).subscribe({
      next: () => {
        // Update local state
        this.siteMaterials.update(materials =>
          materials.filter(m => m.id !== siteMaterial.id)
        );

        toast.success('Material removed', {
          description: 'Material has been removed from this site.'
        });
        this.closeRemoveMaterialDialog();
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to remove material. Please try again.';
        this.materialError.set(message);
        toast.error('Failed to remove material', {
          description: message
        });
        console.error('Error removing material:', err);
      }
    });
  }

  // Daily Log methods
  parseTime(timeStr: string): { hours: number; minutes: number } | null {
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return { hours, minutes };
  }

  updateCurrentDailyLog() {
    const date = this.selectedDate();
    const logs = this.dailyLogs();
    const log = logs.find(dl => dl.date === date);
    this.currentDailyLog.set(log || null);

    // Update entries for this log
    if (log) {
      const allEntries = this.dailyLogEntries();
      this.currentDailyLogEntries.set(allEntries.filter(e => e.dailyLogId === log.id));
    } else {
      this.currentDailyLogEntries.set([]);
    }
  }

  onDateChange(newDate: string) {
    this.selectedDate.set(newDate);
    this.updateCurrentDailyLog();
    this.dailyLogError.set('');
    this.dailyLogSuccess.set('');
  }

  createTodaysLog() {
    const currentSite = this.site();
    const currentUser = this.user();
    if (!currentSite || !currentUser) return;

    // Enforce: site managers can only create logs for today's date
    if (!this.canEditDailyLogForSelectedDate()) {
      toast.error('Action not allowed', {
        description: 'You can only create a daily log for today.'
      });
      return;
    }

    const newLog: DailyLog = {
      id: this.generateId(),
      siteId: currentSite.id,
      date: this.selectedDate(),
      createdBy: currentUser.id,
      notes: ''
    };

    this.logsService.create(newLog).subscribe({
      next: (created) => {
        this.dailyLogs.update(logs => [...logs, created]);
        this.currentDailyLog.set(created);
        toast.success('Daily log created', {
          description: 'Daily log has been created for this date.'
        });
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to create daily log. Please try again.';
        this.dailyLogError.set(message);
        toast.error('Failed to create daily log', {
          description: message
        });
        console.error('Error creating daily log:', err);
      }
    });
  }

  openAddEntryDialog() {
    if (!this.canEditDailyLogForSelectedDate()) {
      toast.error('Action not allowed', {
        description: 'You can only add entries to today\'s log.'
      });
      return;
    }
    this.entryForm.set({
      workerId: '',
      startTime: '08:00',
      endTime: '17:00',
      breakMinutes: 60,
      notes: ''
    });
    this.dailyLogError.set('');
    this.dailyLogSuccess.set('');
    this.showAddEntryDialog.set(true);
  }

  closeAddEntryDialog() {
    this.showAddEntryDialog.set(false);
  }

  updateEntryWorkerId(workerId: string) {
    this.entryForm.update(form => ({ ...form, workerId }));
  }

  updateEntryStartTime(startTime: string) {
    this.entryForm.update(form => ({ ...form, startTime }));
  }

  updateEntryEndTime(endTime: string) {
    this.entryForm.update(form => ({ ...form, endTime }));
  }

  updateEntryBreakMinutes(breakMinutes: number) {
    this.entryForm.update(form => ({ ...form, breakMinutes }));
  }

  updateEntryNotes(notes: string) {
    this.entryForm.update(form => ({ ...form, notes }));
  }

  validateEntry(): string | null {
    const form = this.entryForm();

    if (!form.workerId) {
      return 'Please select a worker';
    }

    if (!this.isWorkerAssigned(form.workerId)) {
      return 'Selected worker is not assigned to this site';
    }

    if (!form.startTime || !form.endTime) {
      return 'Please enter start and end times';
    }

    const start = this.parseTime(form.startTime);
    const end = this.parseTime(form.endTime);
    if (!start || !end) {
      return 'Invalid time format';
    }

    const startMinutes = start.hours * 60 + start.minutes;
    const endMinutes = end.hours * 60 + end.minutes;
    if (endMinutes <= startMinutes) {
      return 'End time must be after start time';
    }

    if (form.breakMinutes < 0) {
      return 'Break minutes cannot be negative';
    }

    const totalMinutes = endMinutes - startMinutes;
    if (form.breakMinutes >= totalMinutes) {
      return 'Break time must be less than total time';
    }

    return null;
  }

  submitAddEntry() {
    if (!this.canEditDailyLogForSelectedDate()) {
      toast.error('Action not allowed', {
        description: 'You can only add entries to today\'s log.'
      });
      return;
    }
    const validationError = this.validateEntry();
    if (validationError) {
      this.dailyLogError.set(validationError);
      setTimeout(() => this.dailyLogError.set(''), 3000);
      return;
    }

    const log = this.currentDailyLog();
    if (!log) return;

    const form = this.entryForm();
    const newEntry: DailyLogEntry = {
      id: this.generateId(),
      dailyLogId: log.id,
      workerId: form.workerId,
      startTime: form.startTime,
      endTime: form.endTime,
      breakMinutes: form.breakMinutes,
      notes: form.notes
    };

    this.dailyLogEntriesService.create(newEntry).subscribe({
      next: (created) => {
        this.dailyLogEntries.update(entries => [...entries, created]);
        this.currentDailyLogEntries.update(entries => [...entries, created]);
        toast.success('Entry added', {
          description: 'Daily log entry has been added successfully.'
        });
        this.closeAddEntryDialog();
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to add entry. Please try again.';
        this.dailyLogError.set(message);
        toast.error('Failed to add entry', {
          description: message
        });
        console.error('Error adding entry:', err);
      }
    });
  }

  openEditEntryDialog(entry: DailyLogEntry) {
    if (!this.canEditDailyLogForSelectedDate()) {
      toast.error('Action not allowed', {
        description: 'You can only edit entries on today\'s log.'
      });
      return;
    }
    this.entryToEdit.set(entry);
    this.entryForm.set({
      workerId: entry.workerId,
      startTime: entry.startTime,
      endTime: entry.endTime,
      breakMinutes: entry.breakMinutes,
      notes: entry.notes || ''
    });
    this.dailyLogError.set('');
    this.dailyLogSuccess.set('');
    this.showEditEntryDialog.set(true);
  }

  closeEditEntryDialog() {
    this.showEditEntryDialog.set(false);
    this.entryToEdit.set(null);
  }

  submitEditEntry() {
    if (!this.canEditDailyLogForSelectedDate()) {
      toast.error('Action not allowed', {
        description: 'You can only edit entries on today\'s log.'
      });
      return;
    }
    const validationError = this.validateEntry();
    if (validationError) {
      this.dailyLogError.set(validationError);
      setTimeout(() => this.dailyLogError.set(''), 3000);
      return;
    }

    const entry = this.entryToEdit();
    if (!entry) return;

    const form = this.entryForm();
    const updatedEntry: DailyLogEntry = {
      ...entry,
      workerId: form.workerId,
      startTime: form.startTime,
      endTime: form.endTime,
      breakMinutes: form.breakMinutes,
      notes: form.notes
    };

    this.dailyLogEntriesService.update(entry.id, updatedEntry).subscribe({
      next: (updated) => {
        this.dailyLogEntries.update(entries =>
          entries.map(e => e.id === updated.id ? updated : e)
        );
        this.currentDailyLogEntries.update(entries =>
          entries.map(e => e.id === updated.id ? updated : e)
        );
        toast.success('Entry updated', {
          description: 'Daily log entry has been updated successfully.'
        });
        this.closeEditEntryDialog();
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to update entry. Please try again.';
        this.dailyLogError.set(message);
        toast.error('Failed to update entry', {
          description: message
        });
        console.error('Error updating entry:', err);
      }
    });
  }

  openDeleteEntryDialog(entry: DailyLogEntry) {
    if (!this.canEditDailyLogForSelectedDate()) {
      toast.error('Action not allowed', {
        description: 'You can only delete entries from today\'s log.'
      });
      return;
    }
    this.entryToDelete.set(entry);
    this.dailyLogError.set('');
    this.showDeleteEntryDialog.set(true);
  }

  closeDeleteEntryDialog() {
    this.showDeleteEntryDialog.set(false);
    this.entryToDelete.set(null);
  }

  confirmDeleteEntry() {
    if (!this.canEditDailyLogForSelectedDate()) {
      toast.error('Action not allowed', {
        description: 'You can only delete entries from today\'s log.'
      });
      return;
    }
    const entry = this.entryToDelete();
    if (!entry) return;

    this.dailyLogEntriesService.delete(entry.id).subscribe({
      next: () => {
        this.dailyLogEntries.update(entries =>
          entries.filter(e => e.id !== entry.id)
        );
        this.currentDailyLogEntries.update(entries =>
          entries.filter(e => e.id !== entry.id)
        );
        toast.success('Entry deleted', {
          description: 'Daily log entry has been deleted successfully.'
        });
        this.closeDeleteEntryDialog();
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to delete entry. Please try again.';
        this.dailyLogError.set(message);
        toast.error('Failed to delete entry', {
          description: message
        });
        console.error('Error deleting entry:', err);
      }
    });
  }

  // Helper to generate UUID (matching the backend pattern)
  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
