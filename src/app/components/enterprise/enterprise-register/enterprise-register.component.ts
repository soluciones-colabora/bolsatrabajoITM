import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Enterprise } from '../../../interfaces/enterprise.interface';
import { EnterpriseService } from '../../../services/enterprise.service';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { EmailAvailableValidator } from "../../../validators/email-available.directive";
import { matchEmailValidator } from "../../../validators/match-email.directive";
import { matchPasswordValidator } from "../../../validators/match-password.directive";
import { ToastrService } from 'ngx-toastr';

import { Observable } from 'rxjs';
import { map, take, tap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-enterpriseregister',
  templateUrl: './enterprise-register.component.html',
  styleUrls: ['./enterprise-register.component.scss']
})
export class EnterpriseRegisterComponent implements OnInit {
  public modalMessage: string;

  public formulario: FormGroup;
  // Definimos un objeto empresa con los valores default.
  public enterprise: Enterprise = {
    // Información DB
    role: 'enterprise',
    status: 'pending',
    // Datos de contacto
    firstName:  '',
    lastName:   '',
    middleName: '',
    job:        '',
    department: '',
    email:      '',
    contactPhone: 0,
    contactAddress: '',

    // Datos empresa
    comercialName:  '',
    bussinessName:  '',
    bussinessPhone: '',
    bussinessTurn:  '',
    description:    '',
    RFC:            '',
    logo: '',
    webURL: '',

    // Dirección
    address: {
      mainStreet: '',
      crossings:  '',
      postalCode:  0,
      state:      '',
      municipality: '',
      city: ''
    }

  };

  public file: File;
  public fileError = {
    'unsupported' : false,
    'size' : false,
  };

  // Main task
  private task: AngularFireUploadTask;

    // Download URL
  private downloadURL: Observable<string>;


  constructor(private enterpriseService: EnterpriseService,
    private storage: AngularFireStorage,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private emailAvailable: EmailAvailableValidator,
    private toastr:  ToastrService) {
      this.formulario = this.formBuilder.group({
        // Hay que agregrar verificación si existen usuarios:
        email: ['', {
          updateOn: 'blur',
          validators: Validators.compose([Validators.required, Validators.email]),
          asyncValidators : this.emailAvailable.validate.bind(this.emailAvailable)
        }],
        email_confirm: ['', Validators.required],

        password: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]{6,18}/)])],
        password_confirm: ['', Validators.required],
        // Datos contacto
        firstName:      ['', Validators.required],
        lastName:       ['', Validators.required],
        middleName:     ['', Validators.required],
        job:            ['', Validators.required],
        department:     ['', Validators.required],
        contactPhone:   ['', Validators.compose([Validators.required, Validators.pattern(/^[0-9]{8,10}/), Validators.max(9999999999)])],
        contactAddress: ['', Validators.required],

        // Datos de la empresa
        comercialName:  ['', Validators.required],
        bussinessName:  ['', Validators.required],
        bussinessPhone: ['', Validators.compose([Validators.required, Validators.pattern(/^[0-9]{8,10}/), Validators.max(9999999999)])],
        description:    ['', Validators.required],
        bussinessTurn:  ['', Validators.required],
        logo:           [''],
        // tslint:disable-next-line:max-line-length
        RFC: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9]{12,13}/)])],
        webURL: ['', Validators.compose([
          Validators.pattern(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)])],

        // Dirección de la empresa
        mainStreet:   ['', Validators.required],
        crossings:    ['', Validators.required],
        postalCode:   ['', Validators.compose([Validators.required, Validators.pattern(/^[0-9]{5}/), Validators.max(99999)])],
        city:         ['', Validators.required],
        municipality: ['', Validators.required],
        state:        ['', Validators.required],
      }, { validator: Validators.compose([matchEmailValidator, matchPasswordValidator]) });
  }

  ngOnInit() {
  }

  register(registerModal) {
    this.modalMessage = '¿Deseas registrarte?';
    // El modal se invoca con una promesa que se resuelve si el modal es aceptado o se reachaza si es cerrado
    this.modalService.open(registerModal).result.then(() => {
      // Aquí se incluye la lógica cuando el modal ha sido aceptado
      this.authService.signup(this.formulario.value.email, this.formulario.value.password).then(credential => {
        this.uploadFile(this.file, credential.user.uid)
        .then((url) => {
          // Se asignan los valores del formulario al objeto student.
          this.assign(this.enterprise, this.formulario.value);

          // Propiedades adicionales a incluir.
          this.enterprise.uid = credential.user.uid;
          this.enterprise.logo = url;
          this.enterpriseService.createEnterprise(this.enterprise).then(smt => {
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
      }).catch((err) => {
        this.toastr.error('¡Hubo un error con su registro!', '¡Error!');
      });
    }, (reason) => {
      // Si el usuario oprime cancelar
    });
  }

  resetForm() {
    this.formulario.reset();
    setTimeout(() => {
      this.router.navigate(['index']);
    }, 400);
  }

  onFileChange(event: FileList) {
    if (event.length === 0) { return; }
    this.file = null;
    // Client-side validation example
    if (event.item(0).type.split('/')[0] !== 'image') {
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

  newsubmit(file: File, id: string) {
    this.uploadFile(file, id).then((url) => {
      console.log('url :', url);
      console.log('typeof url :', typeof url);
    }).catch((err) => {
      console.log('err :', err);
    });
  }

  private uploadFile(file: File, id: string) {

    // The storage path
    const path = `enterprise/${id}.png`;

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
