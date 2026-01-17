import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const expectedRoles = route.data['roles'] as Array<string>;

  return authService.userProfile$.pipe(
    take(1),
    map(profile => {
      if (!profile) {
        router.navigate(['/login']);
        return false;
      }

      if (expectedRoles.includes(profile.role)) {
        return true;
      }

      router.navigate(['/']); // Or access-denied
      return false;
    })
  );
};
