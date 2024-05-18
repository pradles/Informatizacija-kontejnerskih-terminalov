import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, UserRole } from '../services/auth.service'; 
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(!this.authService.isLoggedIn()) {
      return this.router.parseUrl('/login');
    }

    const expectedRoles = next.data['expectedRoles'];

    if (!expectedRoles || expectedRoles.length === 0) {
      return true; // No role restrictions, allow access
    }

    return this.authService.getUserRoles().pipe(
      map(userRoles => {
        //console.log(userRoles);

        // Check if the user has any of the expected roles
        const hasMatchingRole = expectedRoles.some((role: any) => userRoles.includes(role));

        if (!hasMatchingRole) {
          // Redirect to unauthorized page or handle unauthorized access
          return this.router.parseUrl('/unauthorized');
        }

        return true;
      })
    );
  }
}
