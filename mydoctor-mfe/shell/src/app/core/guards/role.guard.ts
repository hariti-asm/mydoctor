import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const expectedRoles = route.data['roles'] as Array<string>;

  return authService.waitForProfile().pipe(
    take(1),
    map(profile => {
      const getRoleString = (role: any): string => {
        if (!role) return '';
        if (typeof role === 'string') return role;
        return role.name || role.code || role.toString();
      };

      const userRole = getRoleString(profile?.role).toUpperCase();
      const normalizedExpectedRoles = expectedRoles.map(r => r.toUpperCase());
      
      console.log('RoleGuard: checking access', { expectedRoles: normalizedExpectedRoles, userRole });
      
      if (profile && userRole && normalizedExpectedRoles.includes(userRole)) {
        return true;
      }

      console.warn('RoleGuard: Access denied. Redirecting to home.', { expectedRoles: normalizedExpectedRoles, userRole });
      router.navigate(['/']); 
      return false;
    })
  );
};
