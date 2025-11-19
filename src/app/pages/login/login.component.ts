import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { UsersService } from '../../core/users.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { User } from '../../../core/models';
import { toast } from 'ngx-sonner';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from '../../components/language-switcher.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, HlmButtonImports, TranslocoModule, LanguageSwitcherComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private translocoService = inject(TranslocoService);

  users = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  error = signal('');
  loading = signal(false);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.usersService.list().subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: (err) => {
        this.error.set(this.translocoService.translate('login.failedToLoadUsers'));
        toast.error(this.translocoService.translate('login.failedToLoadUsers'), {
          description: this.translocoService.translate('login.errorLoadingUsers')
        });
        console.error('Error loading users:', err);
      }
    });
  }

  selectUser(user: User) {
    this.selectedUser.set(user);
    this.error.set('');
  }

  onLogin() {
    const user = this.selectedUser();
    if (!user) {
      this.error.set(this.translocoService.translate('login.pleaseSelectUser'));
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(user.email).subscribe({
      next: () => {
        this.loading.set(false);
        toast.success(this.translocoService.translate('login.loginSuccess'), {
          description: this.translocoService.translate('login.welcomeBackUser', { email: user.email })
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.translocoService.translate('login.loginFailed'));
        toast.error(this.translocoService.translate('login.loginFailed'), {
          description: this.translocoService.translate('login.unableToSignIn')
        });
        console.error('Login error:', err);
      }
    });
  }
}
