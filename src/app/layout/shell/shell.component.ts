import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, HlmButtonImports],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  authService = inject(AuthService);

  user = computed(() => this.authService.user);
  isOrgAdmin = computed(() => this.authService.hasRole('org_admin'));

  onLogout() {
    this.authService.logout();
  }
}
