import { Directive, forwardRef, Injectable } from '@angular/core';
import {
  AsyncValidator,
  AbstractControl,
  NG_ASYNC_VALIDATORS,
  ValidationErrors
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class EmailAvailableValidator implements AsyncValidator {
  constructor(private authService: AuthService) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return new Promise((resolve, reject) => {
      this.authService.verifyEmail(ctrl.value)
      .then((arr) => {
        resolve(arr.length ? {emailAvailable : true} : null);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

@Directive({
  selector: '[appEmailAvailable]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => EmailAvailableValidator),
      multi: true
    }
  ]
})
export class EmailAvailableDirective {

  constructor(private validator: EmailAvailableValidator) { }

  validate(control: AbstractControl) {
    this.validator.validate(control);
  }
}
