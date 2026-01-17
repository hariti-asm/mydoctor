import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CtaComponent } from '../cta/cta.component';
import { FooterComponent } from '../footer/footer.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { AboutComponent } from '../components/about/about.component';
import { FeaturesComponent } from '../features/features.component';
import { HeroComponent } from '../hero/hero.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [FormsModule, CtaComponent, FooterComponent, TestimonialsComponent, AboutComponent, FeaturesComponent, HeroComponent, NavigationComponent],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  private redirectByRole(): void {
    this.authService.waitForProfile().pipe(take(1)).subscribe(profile => {
      if (profile.role === 'DOCTOR') {
        this.router.navigate(['/portal/doctor/dashboard']);
      } else if (profile.role === 'PATIENT') {
        this.router.navigate(['/portal/patient/dashboard']);
      }
    });
  }
}
