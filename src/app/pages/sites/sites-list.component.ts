import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Site, Worker, SiteAssignment } from '../../../core/models';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { SitesService } from '../../core/sites.service';
import { WorkersService } from '../../core/workers.service';
import { AssignmentsService } from '../../core/assignments.service';
import { forkJoin } from 'rxjs';
import { toast } from 'ngx-sonner';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

interface SiteWithManager extends Site {
  managerName?: string;
}

@Component({
  selector: 'app-sites-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HlmButtonImports, TranslocoModule],
  templateUrl: './sites-list.component.html',
  styleUrl: './sites-list.component.css'
})
export class SitesListComponent implements OnInit {
  private sitesService = inject(SitesService);
  private workersService = inject(WorkersService);
  private assignmentsService = inject(AssignmentsService);
  private translocoService = inject(TranslocoService);

  sites = signal<SiteWithManager[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadSites();
  }

  loadSites() {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      sites: this.sitesService.list(),
      workers: this.workersService.list(),
      assignments: this.assignmentsService.list()
    }).subscribe({
      next: ({ sites, workers, assignments }) => {
        // Map sites with their project managers
        const sitesWithManagers: SiteWithManager[] = sites.map(site => {
          // Find the site_manager assignment for this site
          const managerAssignment = assignments.find(
            a => a.siteId === site.id && a.role === 'site_manager'
          );

          // Find the worker who is the manager
          const manager = managerAssignment
            ? workers.find(w => w.id === managerAssignment.workerId)
            : undefined;

          return {
            ...site,
            managerName: manager?.name || this.translocoService.translate('common.notAssigned')
          };
        });

        this.sites.set(sitesWithManagers);
        this.loading.set(false);
      },
      error: (err) => {
        const message = err.error?.message || this.translocoService.translate('sites.errorLoadingSites');
        this.error.set(message);
        this.loading.set(false);
        toast.error(this.translocoService.translate('sites.errorLoadingSites'), {
          description: message
        });
        console.error('Error loading sites:', err);
      }
    });
  }
}
