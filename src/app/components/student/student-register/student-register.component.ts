import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Student } from '../../../interfaces/student.interface';
import { StudentService } from '../../../services/student.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { EmailAvailableValidator } from "../../../validators/email-available.directive";
import { matchEmailValidator } from "../../../validators/match-email.directive";
import { matchPasswordValidator } from "../../../validators/match-password.directive";
import { ToastrService } from 'ngx-toastr';
import { TextsService } from '../../../services/texts.service';

import { Observable } from 'rxjs';
import { map, take, tap, finalize } from 'rxjs/operators';

declare var $: any;
@Component({
  selector: 'app-studentregister',
  templateUrl: './student-register.component.html',
  styleUrls: ['./student-register.component.scss']
})
export class StudentRegisterComponent implements OnInit {
  public modalMessage: string;

  public formulario: FormGroup;
  public file: File;

  public fileError = {
    'unsupported' : false,
    'size' : false,
  };

  // Main task
  private task: AngularFireUploadTask;

  // Download URL
  private downloadURL: Observable<string>;

  // Se crea un objeto vacío de default
  private student: Student = {
    // Datos personales
    firstName:  '',
    lastName:   '',
    middleName: '',
    age:        '',
    sex:        '',
    email:      '',
    phone:      0,
    maritalStatus: '',
    // Matrícula
    idStudent:  '',

    // Dirección
    address: {
      mainStreet: '',
      crossings:  '',
      postalCode: 0,
      state:      '',
      neighborhood: '',
      municipality: '',
      city: ''
    },

    // Idiomas
    languages: {
      english: {
        written:  '',
        spoken:   '',
        translation: '',
      }
    },

    // Grados académicos
    degree: {
      bachelor: '',
      speciality: '',
      master: '',
      phd: '',
    },
    resumeURL:  '',
    isGraduated: true,

    status: 'pending',
    role: 'student'
  };

  // Posibles errores de validación...
  formErrors = {
    'email': '',
    'password': ''
  };

  validationMessages = {
    'email': {
      'required':      'Email is required.',
      'email':         'Email must be a valid email'
    },
    'password': {
      'required':      'Password is required.',
      'pattern':       'Password must be include at one letter and one number.',
      'minlength':     'Password must be at least 4 characters long.',
      'maxlength':     'Password cannot be more than 40 characters long.',
    }
  };

  constructor(
    public texts: TextsService,
    private studentService: StudentService,
    private storage: AngularFireStorage,
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private emailAvailable: EmailAvailableValidator,
    private toastr:  ToastrService) {
      // Aquí se colocan todos los elementos del formulario
      this.formulario = this.formBuilder.group({
        // Datos de usuario
        email: ['', {
          updateOn: 'blur',
          validators: Validators.compose([Validators.required, Validators.email]),
          asyncValidators : this.emailAvailable.validate.bind(this.emailAvailable)
        }],
        email_confirm: ['', Validators.required],
        password: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]{6,18}/),
          ])],
        password_confirm: ['', Validators.required],

        // Información Personal
        firstName:     ['', Validators.required],
        middleName:    ['', Validators.required],
        lastName:      ['', Validators.required],
        sex:           ['', Validators.required],
        age:           ['', Validators.required],
        maritalStatus: ['', Validators.required],

        // Dirección
        mainStreet:   ['', Validators.required],
        crossings:    ['', Validators.required],
        postalCode:   ['', Validators.compose([Validators.required, Validators.pattern(/^[0-9]{5}/), Validators.max(99999)])],
        city:         ['', Validators.required],
        municipality: ['', Validators.required],
        state:        ['', Validators.required],

        // Información académica
        idStudent:  ['', Validators.compose([Validators.required, Validators.pattern(/^E{1}[0-9]{7}/), Validators.maxLength(9)])],
        bachelor:   ['', Validators.required],
        speciality: [''],
        master:     [''],
        phd:        [''],

        // Inglés
        spoken:      ['', Validators.compose([Validators.required, Validators.max(100), Validators.min(0)])],
        written:     ['', Validators.compose([Validators.required, Validators.max(100), Validators.min(0)])],
        translation: ['', Validators.compose([Validators.required, Validators.max(100), Validators.min(0)])],
      }, { validator: Validators.compose([matchEmailValidator, matchPasswordValidator]) });
  }

  ngOnInit() {

  }

  register(registerModal) {
    this.modalMessage = '¿Deseas registrarte?';
    // El modal se invoca con una promesa que se resuelve si el modal es aceptado o se reachaza si es cerrado
    this.modalService.open(registerModal).result.then(() => {
      // Aquí se incluye la lógica cuando el modal ha sido aceptado

      // Crear usuario en firebase auth.
      this.authService.signup(this.formulario.value.email, this.formulario.value.password).then(credential => {
        this.uploadFile(this.file, credential.user.uid).then((url) => {
          // Se asignan los valores del formulario al objeto student.
          this.assign(this.student, this.formulario.value);

          // Propiedades adicionales a incluir.
          this.student.uid = credential.user.uid;
          this.student.resumeURL = url;
          this.studentService.createStudent(this.student).then(smt => {
            this.toastr.success('¡Su registro se realizó exitosamente!', '¡Éxito!');
            this.toastr.info('Por favor revise en su bandeja de entrada o spam el correo de verifiación de cuenta', '¡Importante!', {
              timeOut: 10000
            });
            this.router.navigate(['/index']);
            // setTimeout(() => {
            //   this.router.navigate(['/index']);
            // }, 3000);
          }).catch((err) => {
            this.toastr.error('¡Hubo un error con su registro!', '¡Error!');
          });
        }).catch((err) => {
          this.toastr.error('¡Hubo un error con su registro!', '¡Error!');
        });
      })
      .catch((err) => {
        this.toastr.error('¡Hubo un error con su registro!', '¡Error!');
      });
    }, (reason) => {
      // Si el usuario oprime cancelar
    });
  }


  cancelar( ) {
    this.formulario.reset();
    // this.router.navigate(['/index']);
  }

  onFileChange(event: FileList) {
    if (event.length === 0) { return; }
    this.file = null;
    // Se resetean los errores.
    this.fileError.unsupported = false;
    this.fileError.size = false;

    // Client-side validation example
    if (event.item(0).type.split('/')[1] !== 'pdf') {
      console.error('unsupported file type :( ');
      this.fileError.unsupported = true;
      return;
    }

    if (event.item(0).size >= (1 * 1024 * 1024)) {
      console.error('file too large ');
      this.fileError.size = true;
      return;
    }

    this.file = event.item(0);
  }

  private uploadFile(file: File, id: string) {

    // The storage path
    const path = `student/${id}.pdf`;

    // Totally optional metadata
    const customMetadata = { uid: id };

    // The main task
    this.task = this.storage.upload(path, file, { customMetadata });

    const fileRef = this.storage.ref(path);

    // The file's download URL
    // this.task.snapshotChanges().pipe(
    //   finalize(() => this.downloadURL = fileRef.getDownloadURL() )
    // ).subscribe();

    // The file's download URL
    return new Promise<string>((resolve, reject) => {
      this.task.snapshotChanges().pipe(
      finalize(() => this.downloadURL = fileRef.getDownloadURL() )
      ).toPromise()
      .then(() => {
        this.downloadURL = fileRef.getDownloadURL();
        this.downloadURL.toPromise()
        .then((url) => {
          resolve(url);
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });


  }

  private getDismissReason(reason: any): string {

    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  private assign(object: any, objectToCopy: any) {
    // Si el objeto a copiar tiene subobjetos, regresamos a la función..
    for (const key in objectToCopy) {
      if (objectToCopy.hasOwnProperty(key)) {
        if ( typeof objectToCopy[key] === 'object' && !Array.isArray(objectToCopy[key])) {
          this.assign(object, objectToCopy[key]);
        }
      }
    }
    // Cuando se llega aquí objectToCopy ya no tiene subobjetos
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        if ( typeof object[key] === 'object' && !Array.isArray(object[key])) {
          this.assign(object[key], objectToCopy);
        } else if ( objectToCopy[key]) {
          object[key] = objectToCopy[key];
        }
      }
    }
  }

}


