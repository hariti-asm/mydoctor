import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './navigation.component.html',
  standalone: true,
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {
  isLoggedIn$;
  userProfile$;
  showProfileMenu = false;

  constructor(
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.userProfile$ = this.authService.userProfile$;
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }

  getCurrentLang(): string {
    return this.translate.currentLang || 'en';
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  logout() {
    this.authService.logout();
    this.showProfileMenu = false;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }
}
