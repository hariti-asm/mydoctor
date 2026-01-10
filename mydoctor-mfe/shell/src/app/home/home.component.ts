import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CtaComponent} from '../cta/cta.component';
import {FooterComponent} from '../footer/footer.component';
import {TestimonialsComponent} from '../testimonials/testimonials.component';
import {AboutComponent} from '../components/about/about.component';
import {FeaturesComponent} from '../features/features.component';
import {HeroComponent} from '../hero/hero.component';
import {NavigationComponent} from '../navigation/navigation.component';

@Component({
  selector: 'app-home',
  imports: [ FormsModule, CtaComponent, FooterComponent, TestimonialsComponent, AboutComponent, FeaturesComponent, HeroComponent, NavigationComponent],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
