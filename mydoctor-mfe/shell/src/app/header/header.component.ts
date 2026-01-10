import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import {AuthService} from '../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  isMobileMenuOpen = false;
  isLoggedIn = false;
  userName: string | null = null;

  private subscriptions = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Listen to login status
    this.subscriptions.add(
      this.authService.isLoggedIn$.subscribe(isLogged => {
        this.isLoggedIn = isLogged;
      })
    );

    // Listen to user profile changes
    this.subscriptions.add(
      this.authService.userProfile$.subscribe(profile => {
        this.userName = profile
          ? `${profile.firstName} ${profile.lastName}`
          : null;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Toggle mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Smooth scroll to section
  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.isMobileMenuOpen = false;
  }

  // Logout
  onLogout(): void {
    this.authService.logout();
  }
}
