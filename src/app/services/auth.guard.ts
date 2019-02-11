import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService} from './auth.service';
import { map, take, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      // Esto sólo verifica que el usuario esté logeado...
      return this.auth.user.pipe(
        take(1),
        map(user => !!user),
        tap(loggedIn => {
          if (!loggedIn) {
            // console.log('access denied');
            // this.notify.update('You must be logged in!', 'error');
            this.router.navigate(['/login']);
          }
        })
      );
  }
}

@Injectable({
  providedIn: 'root'
})
export class NotAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      // Esto sólo verifica que el usuario no esté logeado...
      return this.auth.user.pipe(
        take(1),
        map(user => !!!user),
        tap(notLoggedIn => {
          if (!notLoggedIn) {
            // console.log('access denied');
            // this.notify.update('You must be logged in!', 'error');
            this.router.navigate(['/index']);
          }
        })
      );
  }
}
