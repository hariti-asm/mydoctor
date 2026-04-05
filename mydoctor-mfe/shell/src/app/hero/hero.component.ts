import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './hero.component.html',
  standalone: true,
  styleUrl: './hero.component.css'
})
export class HeroComponent {

}
