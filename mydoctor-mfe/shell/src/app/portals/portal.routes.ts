import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

export const PORTAL_ROUTES: Routes = [
  {
    path: 'patient',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] },
    loadComponent: () => import('./patient/layout/patient-layout.component').then(m => m.PatientLayoutComponent),
    children: [
        { path: 'dashboard', loadComponent: () => import('./patient/dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent) },
        { path: 'medical-history', loadComponent: () => import('./patient/medical-history/medical-history.component').then(m => m.MedicalHistoryComponent) },
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DOCTOR'] },
    loadComponent: () => import('./doctor/layout/doctor-layout.component').then(m => m.DoctorLayoutComponent),
    children: [
        { path: 'dashboard', loadComponent: () => import('./doctor/dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent) },
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
        { path: 'dashboard', loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'video-call/:id', loadComponent: () => import('../features/video-call/video-call.component').then(m => m.VideoCallComponent) },
  {
      path: '',
      redirectTo: 'patient',
      pathMatch: 'full'
  }
];
