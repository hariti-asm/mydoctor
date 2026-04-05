import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-features',
  imports: [
    NgIf,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './features.component.html',
  standalone: true,
  styleUrl: './features.component.css'
})
export class FeaturesComponent {
}
