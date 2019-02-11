import { Directive } from '@angular/core';
import { AbstractControl, FormGroup, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

/** A hero's name can't match the hero's alter ego */
export const matchEmailValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const email = control.get('email');
  const email_confirm = control.get('email_confirm');
  return email && email_confirm && email.value !== email_confirm.value ? { 'matchEmail': true } : null;
};

@Directive({
  selector: '[appMatchEmailValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchEmailValidatorDirective, multi: true }]
})
export class MatchEmailValidatorDirective implements Validator {

  validate(control: AbstractControl): ValidationErrors {
    return matchEmailValidator(control);
  }

}
