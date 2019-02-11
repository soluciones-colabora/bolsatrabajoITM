import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  public loading = true;
  public user;
  // tslint:disable-next-line:no-inferrable-types
  show: boolean = false;

  public role;
  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.user.pipe(takeUntil(this.ngUnsubscribe)).subscribe((user) => {
      this.loading = false;
      this.user = user;
      // if (!user && this.router.url !== '/login') { this.router.navigate(['/index']); }
      if (!user) { this.router.navigate(['/index']); }
    });
  }
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
