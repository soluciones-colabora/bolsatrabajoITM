import { Directive } from '@angular/core';
import { AbstractControl, FormGroup, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

/** A hero's name can't match the hero's alter ego */
export const matchPasswordValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const password = control.get('password');
  const password_confirm = control.get('password_confirm');

  return password && password_confirm && password.value !== password_confirm.value ? { 'matchPassword': true } : null;
};

@Directive({
  selector: '[appMatchValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchPasswordValidatorDirective, multi: true }]
})
export class MatchPasswordValidatorDirective implements Validator {

  validate(control: AbstractControl): ValidationErrors {
    return matchPasswordValidator(control);
  }

}
