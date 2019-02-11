import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService} from './auth.service';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudentGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      return this.auth.user.pipe(
        take(1),
        map(user => {
          // Primero se verifica que el usuario esté loggeado,
          // Luego se verifica que el role sea de student.
          return !!user ? ((user.role === 'student') || (user.role === 'admin')) : false;
        }),
        tap(loggedIn => {
          if (!loggedIn) {
            console.log('access denied');
            // this.notify.update('You must be logged in!', 'error');
            this.router.navigate(['/index']);
          }
        })
      );
  }
}

@Injectable({
  providedIn: 'root'
})
export class NotStudentGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      return this.auth.user.pipe(
        take(1),
        map(user => {
          // Primero se verifica que el usuario esté loggeado,
          // Luego se verifica que el role sea de student.
          return !!user ? (user.role !== 'student') : false;
        }),
        tap(loggedAndNotStuden => {
          if (!loggedAndNotStuden) {
            // console.log('access denied');
            // this.notify.update('You must be logged in!', 'error');
            this.router.navigate(['/index']);
          }
        })
      );
  }
}
