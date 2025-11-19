import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { User, Role, Site, SiteAssignment } from '../../core/models';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private translocoService = inject(TranslocoService);
  private currentUserSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;
  public currentUser = signal<User | null>(null);

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    const initialUser = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.user$ = this.currentUserSubject.asObservable();
    this.currentUser.set(initialUser);

    // Set language from user preference
    if (initialUser?.language) {
      this.translocoService.setActiveLang(initialUser.language);
    }
  }

  /**
   * Get the current user synchronously
   */
  get user(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Login a user by email
   * Fetches the user from the fake backend
   */
  login(email: string): Observable<User> {
    // Find user by email through fake backend
    return this.http.get<User[]>('/api/users').pipe(
      map((users) => {
        const user = users.find(u => u.email === email);
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      }),
      tap((user) => {
        this.currentUserSubject.next(user);
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Set language from user preference
        if (user.language) {
          this.translocoService.setActiveLang(user.language);
        }

        // Navigate to sites after successful login
        this.router.navigate(['/sites']);
      })
    );
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  /**
   * Update user language preference
   */
  updateUserLanguage(language: 'hr' | 'de' | 'en'): Observable<User> {
    const user = this.currentUserSubject.value;
    if (!user) {
      throw new Error('No user logged in');
    }

    const updatedUser = { ...user, language };

    return this.http.put<User>(`/api/users/${user.id}`, updatedUser).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

  /**
   * Check if the current user has a specific role
   */
  hasRole(role: Role): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.role === role;
  }

  /**
   * Check if the current user belongs to a specific organization
   */
  isOrg(orgId: string): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.organizationId === orgId;
  }
}

/**
 * Check if a user can view a site
 * All users can view sites from their organization
 */
export function canViewSite(user: User | null, site: Site): boolean {
  if (!user) {
    return false;
  }

  // Admins can view all sites
  if (user.role === 'admin') {
    return true;
  }

  // Users can view sites from their organization
  return user.organizationId === site.organizationId;
}

/**
 * Check if a user is a site manager for a specific site
 */
export function isSiteManager(
  user: User | null,
  site: Site,
  assignments: SiteAssignment[]
): boolean {
  if (!user) {
    return false;
  }

  // Check if there's a site_manager assignment for this user and site
  return assignments.some(
    assignment =>
      assignment.siteId === site.id &&
      assignment.workerId === user.id &&
      assignment.role === 'site_manager'
  );
}

/**
 * Check if a user can edit daily logs for a site
 * Rules:
 * - Admin: full access to all sites
 * - Org Admin: full access to sites in their organization
 * - Org Manager: can edit daily logs only on sites where assigned as site manager
 * - Otherwise: view-only (no edit access)
 */
export function canEditDailyLog(
  user: User | null,
  site: Site,
  assignments: SiteAssignment[]
): boolean {
  if (!user) {
    return false;
  }

  // Admins have full access
  if (user.role === 'admin') {
    return true;
  }

  // Must be from the same organization
  if (user.organizationId !== site.organizationId) {
    return false;
  }

  // Org Admins have full access to their organization's sites
  if (user.role === 'org_admin') {
    return true;
  }

  // Org Managers can edit daily logs only on sites where they are assigned as site manager
  if (user.role === 'org_manager') {
    return isSiteManager(user, site, assignments);
  }

  // All other cases: view-only (no edit access)
  return false;
}
