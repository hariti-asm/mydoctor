import { Routes } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { AppointmentListComponent } from './list/appointment-list.component';

export const APPOINTMENT_ROUTES: Routes = [
  { path: 'book/:doctorId', component: BookingComponent },
  { path: 'my-appointments', component: AppointmentListComponent },
];
