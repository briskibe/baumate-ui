import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User, Material, Worker, Site, Client, SiteAssignment } from '../../../core/models';
import { AuthService } from '../../core/auth.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { forkJoin } from 'rxjs';

type Tab = 'workers' | 'materials' | 'sites' | 'clients';

interface WorkerForm {
  name: string;
  email: string;
  phone: string;
}

interface MaterialForm {
  name: string;
  unit: string;
  description: string;
}

interface SiteForm {
  name: string;
  address: string;
  city: string;
  clientId: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  startDate: string;
  endDate: string;
  projectManagerId: string;
}

interface ClientForm {
  name: string;
  email: string;
  phone: string;
  company: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmButtonImports],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Tab state
  activeTab = signal<Tab>('workers');

  // Data
  workers = signal<Worker[]>([]);
  materials = signal<Material[]>([]);
  sites = signal<Site[]>([]);
  clients = signal<Client[]>([]);
  users = signal<User[]>([]);
  assignments = signal<SiteAssignment[]>([]);

  loading = signal(true);
  error = signal('');

  // Worker state
  showWorkerDialog = signal(false);
  editingWorker = signal<Worker | null>(null);
  workerForm = signal<WorkerForm>({
    name: '',
    email: '',
    phone: ''
  });
  showDeleteWorkerConfirm = signal(false);
  workerToDelete = signal<Worker | null>(null);

  // Material state
  showMaterialDialog = signal(false);
  editingMaterial = signal<Material | null>(null);
  materialForm = signal<MaterialForm>({
    name: '',
    unit: '',
    description: ''
  });
  showDeleteMaterialConfirm = signal(false);
  materialToDelete = signal<Material | null>(null);

  // Site state
  showSiteDialog = signal(false);
  editingSite = signal<Site | null>(null);
  siteForm = signal<SiteForm>({
    name: '',
    address: '',
    city: '',
    clientId: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    projectManagerId: ''
  });
  showDeleteSiteConfirm = signal(false);
  siteToDelete = signal<Site | null>(null);

  // Client state
  showClientDialog = signal(false);
  editingClient = signal<Client | null>(null);
  clientForm = signal<ClientForm>({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  showDeleteClientConfirm = signal(false);
  clientToDelete = signal<Client | null>(null);

  // Computed: Check if worker is the admin worker
  isAdminWorker = computed(() => {
    return (workerId: string) => {
      const worker = this.workers().find(w => w.id === workerId);
      if (!worker) return false;
      const adminUser = this.users().find(u => u.role === 'org_admin');
      return adminUser && worker.email === adminUser.email;
    };
  });

  // Computed: Check if worker has app access (has a user account)
  hasAppAccess = computed(() => {
    return (workerId: string) => {
      const worker = this.workers().find(w => w.id === workerId);
      if (!worker || !worker.email) return false;
      return this.users().some(u => u.email === worker.email);
    };
  });

  // Computed: Get site manager name
  getSiteManagerName = computed(() => {
    return (siteId: string) => {
      const assignment = this.assignments().find(a => a.siteId === siteId && a.role === 'site_manager');
      if (!assignment) return 'None';
      const worker = this.workers().find(w => w.id === assignment.workerId);
      return worker?.name || 'Unknown';
    };
  });

  // Computed: Get client name
  getClientName = computed(() => {
    return (clientId?: string) => {
      if (!clientId) return 'None';
      const client = this.clients().find(c => c.id === clientId);
      return client?.name || 'Unknown';
    };
  });

  // Computed: Get worker count for site
  getWorkerCount = computed(() => {
    return (siteId: string) => {
      return this.assignments().filter(a => a.siteId === siteId).length;
    };
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      workers: this.http.get<Worker[]>('/api/workers'),
      materials: this.http.get<Material[]>('/api/materials'),
      sites: this.http.get<Site[]>('/api/sites'),
      clients: this.http.get<Client[]>('/api/clients'),
      users: this.http.get<User[]>('/api/users'),
      assignments: this.http.get<SiteAssignment[]>('/api/assignments')
    }).subscribe({
      next: (data) => {
        this.workers.set(data.workers);
        this.materials.set(data.materials);
        this.sites.set(data.sites);
        this.clients.set(data.clients);
        this.users.set(data.users);
        this.assignments.set(data.assignments);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load data');
        this.loading.set(false);
        console.error('Error loading data:', err);
      }
    });
  }

  setActiveTab(tab: Tab) {
    this.activeTab.set(tab);
  }

  // ===== WORKER METHODS =====

  openAddWorkerDialog() {
    this.editingWorker.set(null);
    this.workerForm.set({ name: '', email: '', phone: '' });
    this.showWorkerDialog.set(true);
  }

  openEditWorkerDialog(worker: Worker) {
    this.editingWorker.set(worker);
    this.workerForm.set({
      name: worker.name,
      email: worker.email || '',
      phone: worker.phone || ''
    });
    this.showWorkerDialog.set(true);
  }

  closeWorkerDialog() {
    this.showWorkerDialog.set(false);
    this.editingWorker.set(null);
    this.workerForm.set({ name: '', email: '', phone: '' });
  }

  submitWorker() {
    const form = this.workerForm();
    if (!form.name.trim()) {
      alert('Name is required');
      return;
    }

    const editing = this.editingWorker();
    if (editing) {
      const updated = {
        ...editing,
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined
      };

      this.http.put<Worker>(`/api/workers/${editing.id}`, updated).subscribe({
        next: (worker) => {
          this.workers.update(workers => workers.map(w => w.id === worker.id ? worker : w));
          this.closeWorkerDialog();
        },
        error: (err) => {
          alert('Failed to update worker');
          console.error('Error updating worker:', err);
        }
      });
    } else {
      const newWorker = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined
      };

      this.http.post<Worker>('/api/workers', newWorker).subscribe({
        next: (worker) => {
          this.workers.update(workers => [...workers, worker]);
          this.closeWorkerDialog();
        },
        error: (err) => {
          alert('Failed to create worker');
          console.error('Error creating worker:', err);
        }
      });
    }
  }

  confirmDeleteWorker(worker: Worker) {
    this.workerToDelete.set(worker);
    this.showDeleteWorkerConfirm.set(true);
  }

  cancelDeleteWorker() {
    this.workerToDelete.set(null);
    this.showDeleteWorkerConfirm.set(false);
  }

  deleteWorker() {
    const worker = this.workerToDelete();
    if (!worker) return;

    this.http.delete(`/api/workers/${worker.id}`).subscribe({
      next: () => {
        this.workers.update(workers => workers.filter(w => w.id !== worker.id));
        this.cancelDeleteWorker();
      },
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message || 'Failed to delete worker';
        alert(message);
        console.error('Error deleting worker:', err);
        this.cancelDeleteWorker();
      }
    });
  }

  giveAppAccess(worker: Worker) {
    if (!worker.email) {
      alert('Worker must have an email address to get app access');
      return;
    }

    const existingUser = this.users().find(u => u.email === worker.email);
    if (existingUser) {
      alert('This worker already has app access');
      return;
    }

    if (!confirm(`Give app access to ${worker.name}? They will become an organization manager.`)) {
      return;
    }

    const newUser = {
      name: worker.name,
      email: worker.email,
      role: 'org_manager' as const,
      organizationId: this.authService.user?.organizationId
    };

    this.http.post<User>('/api/users', newUser).subscribe({
      next: (user) => {
        this.users.update(users => [...users, user]);
        alert(`App access granted to ${worker.name}`);
      },
      error: (err) => {
        alert('Failed to grant app access');
        console.error('Error granting app access:', err);
      }
    });
  }

  // ===== MATERIAL METHODS =====

  openAddMaterialDialog() {
    this.editingMaterial.set(null);
    this.materialForm.set({ name: '', unit: '', description: '' });
    this.showMaterialDialog.set(true);
  }

  openEditMaterialDialog(material: Material) {
    this.editingMaterial.set(material);
    this.materialForm.set({
      name: material.name,
      unit: material.unit,
      description: material.description || ''
    });
    this.showMaterialDialog.set(true);
  }

  closeMaterialDialog() {
    this.showMaterialDialog.set(false);
    this.editingMaterial.set(null);
    this.materialForm.set({ name: '', unit: '', description: '' });
  }

  submitMaterial() {
    const form = this.materialForm();
    if (!form.name.trim() || !form.unit.trim()) {
      alert('Name and Unit are required');
      return;
    }

    const editing = this.editingMaterial();
    if (editing) {
      const updated = {
        ...editing,
        name: form.name.trim(),
        unit: form.unit.trim(),
        description: form.description.trim()
      };

      this.http.put<Material>(`/api/materials/${editing.id}`, updated).subscribe({
        next: (material) => {
          this.materials.update(materials => materials.map(m => m.id === material.id ? material : m));
          this.closeMaterialDialog();
        },
        error: (err) => {
          alert('Failed to update material');
          console.error('Error updating material:', err);
        }
      });
    } else {
      const newMaterial = {
        name: form.name.trim(),
        unit: form.unit.trim(),
        description: form.description.trim() || undefined
      };

      this.http.post<Material>('/api/materials', newMaterial).subscribe({
        next: (material) => {
          this.materials.update(materials => [...materials, material]);
          this.closeMaterialDialog();
        },
        error: (err) => {
          alert('Failed to create material');
          console.error('Error creating material:', err);
        }
      });
    }
  }

  confirmDeleteMaterial(material: Material) {
    this.materialToDelete.set(material);
    this.showDeleteMaterialConfirm.set(true);
  }

  cancelDeleteMaterial() {
    this.materialToDelete.set(null);
    this.showDeleteMaterialConfirm.set(false);
  }

  deleteMaterial() {
    const material = this.materialToDelete();
    if (!material) return;

    this.http.delete(`/api/materials/${material.id}`).subscribe({
      next: () => {
        this.materials.update(materials => materials.filter(m => m.id !== material.id));
        this.cancelDeleteMaterial();
      },
      error: (err) => {
        alert('Failed to delete material');
        console.error('Error deleting material:', err);
        this.cancelDeleteMaterial();
      }
    });
  }

  // ===== SITE METHODS =====

  openAddSiteDialog() {
    this.editingSite.set(null);
    this.siteForm.set({
      name: '',
      address: '',
      city: '',
      clientId: '',
      status: 'planning',
      startDate: '',
      endDate: '',
      projectManagerId: ''
    });
    this.showSiteDialog.set(true);
  }

  openEditSiteDialog(site: Site) {
    const assignment = this.assignments().find(a => a.siteId === site.id && a.role === 'site_manager');
    this.editingSite.set(site);
    this.siteForm.set({
      name: site.name,
      address: site.address,
      city: site.city || '',
      clientId: site.clientId || '',
      status: site.status || 'planning',
      startDate: site.startDate || '',
      endDate: site.endDate || '',
      projectManagerId: assignment?.workerId || ''
    });
    this.showSiteDialog.set(true);
  }

  closeSiteDialog() {
    this.showSiteDialog.set(false);
    this.editingSite.set(null);
    this.siteForm.set({
      name: '',
      address: '',
      city: '',
      clientId: '',
      status: 'planning',
      startDate: '',
      endDate: '',
      projectManagerId: ''
    });
  }

  submitSite() {
    const form = this.siteForm();
    if (!form.name.trim() || !form.address.trim()) {
      alert('Name and Address are required');
      return;
    }

    const editing = this.editingSite();
    const siteData = {
      ...(editing || {}),
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim() || undefined,
      clientId: form.clientId || undefined,
      status: form.status,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined
    };

    const operation = editing
      ? this.http.put<Site>(`/api/sites/${editing.id}`, siteData)
      : this.http.post<Site>('/api/sites', siteData);

    operation.subscribe({
      next: (site) => {
        if (editing) {
          this.sites.update(sites => sites.map(s => s.id === site.id ? site : s));
        } else {
          this.sites.update(sites => [...sites, site]);
        }

        // Update project manager assignment
        if (form.projectManagerId) {
          this.updateProjectManager(site.id, form.projectManagerId);
        }

        this.closeSiteDialog();
      },
      error: (err) => {
        alert(`Failed to ${editing ? 'update' : 'create'} site`);
        console.error(`Error ${editing ? 'updating' : 'creating'} site:`, err);
      }
    });
  }

  updateProjectManager(siteId: string, workerId: string) {
    // Find existing site_manager assignment for this site
    const existingAssignment = this.assignments().find(a => a.siteId === siteId && a.role === 'site_manager');

    if (existingAssignment) {
      if (existingAssignment.workerId === workerId) {
        return; // No change needed
      }
      // Delete old assignment
      this.http.delete(`/api/assignments/${existingAssignment.id}`).subscribe({
        next: () => {
          this.assignments.update(assignments => assignments.filter(a => a.id !== existingAssignment.id));
          // Create new assignment
          this.createManagerAssignment(siteId, workerId);
        },
        error: (err) => {
          console.error('Error removing old project manager:', err);
        }
      });
    } else {
      // Create new assignment
      this.createManagerAssignment(siteId, workerId);
    }
  }

  createManagerAssignment(siteId: string, workerId: string) {
    const site = this.sites().find(s => s.id === siteId);
    const newAssignment = {
      siteId,
      workerId,
      role: 'site_manager' as const,
      assignedDate: new Date().toISOString().split('T')[0],
      startDate: site?.startDate,
      endDate: site?.endDate
    };

    this.http.post<SiteAssignment>('/api/assignments', newAssignment).subscribe({
      next: (assignment) => {
        this.assignments.update(assignments => [...assignments, assignment]);
      },
      error: (err) => {
        console.error('Error creating project manager assignment:', err);
      }
    });
  }

  confirmDeleteSite(site: Site) {
    this.siteToDelete.set(site);
    this.showDeleteSiteConfirm.set(true);
  }

  cancelDeleteSite() {
    this.siteToDelete.set(null);
    this.showDeleteSiteConfirm.set(false);
  }

  deleteSite() {
    const site = this.siteToDelete();
    if (!site) return;

    this.http.delete(`/api/sites/${site.id}`).subscribe({
      next: () => {
        this.sites.update(sites => sites.filter(s => s.id !== site.id));
        this.cancelDeleteSite();
      },
      error: (err) => {
        alert('Failed to delete site');
        console.error('Error deleting site:', err);
        this.cancelDeleteSite();
      }
    });
  }

  viewSiteDetails(siteId: string) {
    this.router.navigate(['/sites', siteId]);
  }

  // ===== CLIENT METHODS =====

  openAddClientDialog() {
    this.editingClient.set(null);
    this.clientForm.set({ name: '', email: '', phone: '', company: '' });
    this.showClientDialog.set(true);
  }

  openEditClientDialog(client: Client) {
    this.editingClient.set(client);
    this.clientForm.set({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || ''
    });
    this.showClientDialog.set(true);
  }

  closeClientDialog() {
    this.showClientDialog.set(false);
    this.editingClient.set(null);
    this.clientForm.set({ name: '', email: '', phone: '', company: '' });
  }

  submitClient() {
    const form = this.clientForm();
    if (!form.name.trim()) {
      alert('Name is required');
      return;
    }

    const editing = this.editingClient();
    if (editing) {
      const updated = {
        ...editing,
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined
      };

      this.http.put<Client>(`/api/clients/${editing.id}`, updated).subscribe({
        next: (client) => {
          this.clients.update(clients => clients.map(c => c.id === client.id ? client : c));
          this.closeClientDialog();
        },
        error: (err) => {
          alert('Failed to update client');
          console.error('Error updating client:', err);
        }
      });
    } else {
      const newClient = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined
      };

      this.http.post<Client>('/api/clients', newClient).subscribe({
        next: (client) => {
          this.clients.update(clients => [...clients, client]);
          this.closeClientDialog();
        },
        error: (err) => {
          alert('Failed to create client');
          console.error('Error creating client:', err);
        }
      });
    }
  }

  confirmDeleteClient(client: Client) {
    this.clientToDelete.set(client);
    this.showDeleteClientConfirm.set(true);
  }

  cancelDeleteClient() {
    this.clientToDelete.set(null);
    this.showDeleteClientConfirm.set(false);
  }

  deleteClient() {
    const client = this.clientToDelete();
    if (!client) return;

    this.http.delete(`/api/clients/${client.id}`).subscribe({
      next: () => {
        this.clients.update(clients => clients.filter(c => c.id !== client.id));
        this.cancelDeleteClient();
      },
      error: (err) => {
        alert('Failed to delete client');
        console.error('Error deleting client:', err);
        this.cancelDeleteClient();
      }
    });
  }
}
