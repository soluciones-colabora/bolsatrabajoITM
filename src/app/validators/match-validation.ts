import {AbstractControl} from '@angular/forms';
export class MatchValidation {

    static MatchPassword(AC: AbstractControl) {
       const password = AC.get('password').value; // to get value in input tag
       const confirmPassword = AC.get('password_confirm').value; // to get value in input tag
        if  (password !== confirmPassword) {
            console.log('false');
            AC.get('confirmPassword').setErrors( {MatchPassword: true} );
        } else {
            console.log('true');
            return null;
        }
    }

    static MatchEmail(AC: AbstractControl) {
       const email = AC.get('email').value; // to get value in input tag
       const confirmEmail = AC.get('email_confirm').value; // to get value in input tag
        if  (email !== confirmEmail) {
            console.log('false');
            AC.get('confirmemail').setErrors( {MatchPassword: true} );
        } else {
            console.log('true');
            return null;
        }
    }
}
