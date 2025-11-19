import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslocoModule, HlmButtonImports],
  template: `
    <div class="flex items-center gap-2">
      <label class="text-sm font-medium text-gray-700">
        {{ 'common.language' | transloco }}:
      </label>
      <select
        [value]="translocoService.getActiveLang()"
        (change)="changeLanguage($event)"
        class="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="hr">Hrvatski</option>
        <option value="de">Deutsch</option>
        <option value="en">English</option>
      </select>
    </div>
  `,
  styles: []
})
export class LanguageSwitcherComponent {
  translocoService = inject(TranslocoService);
  private authService = inject(AuthService);

  changeLanguage(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value as 'hr' | 'de' | 'en';
    this.translocoService.setActiveLang(lang);

    // Update user language preference
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.authService.updateUserLanguage(lang).subscribe();
    }
  }
}
