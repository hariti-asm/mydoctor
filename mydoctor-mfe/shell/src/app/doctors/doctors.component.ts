import { Component } from '@angular/core';
import { DoctorSearchComponent } from '../features/doctor-search/doctor-search.component';

@Component({
  selector: 'app-doctors',
  imports: [DoctorSearchComponent],
  templateUrl: './doctors.component.html',
  standalone: true,
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent {

}
