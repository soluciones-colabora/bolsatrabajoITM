import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService} from './auth.service';
import { map, take, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      // console.log('next :', next);
      // console.log('state :', state.url.toString());
      // console.log('id :', next.params.id);
      return this.auth.user.pipe(
        take(1),
        map(user => {
          // Primero se verifica que el usuario esté loggeado, luego se verifica si
          // el id solicitado coincide con el suyo
          // Permitimos ver el perfil sólo si es del mismo usuario ...
          return !!user ? ((user.uid === next.params.id) || (user.role === 'admin')) : false;
        }),
        tap(loggedIn => {
          if (!loggedIn) {
            console.log('Access denied!');
            // this.notify.update('You must be logged in!', 'error');
            this.router.navigate(['/index']);
          }
        })
      );
  }
}
