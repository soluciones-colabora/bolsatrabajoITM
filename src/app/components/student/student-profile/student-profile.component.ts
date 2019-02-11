import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { NgForm } from '@angular/forms';
import { Student } from '../../../interfaces/student.interface';
import { StudentService } from '../../../services/student.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TextsService } from '../../../services/texts.service';

import {NgbAlertConfig} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { map, take, tap, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-studentprofile',
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.scss']
})
export class StudentProfileComponent implements OnInit {

  public student$: Observable<Student>;
  public modalMessage: string;
  public isreadonly = true;

  public file: File;
  public fileError = {
    'unsupported' : false,
    'size' : false,
  };


  public formulario: FormGroup;

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

  // Main task
  private task: AngularFireUploadTask;


  // Download URL
  private downloadURL: Observable<string>;

  public animationSwitch = false;
  public messageAlert: string;

  constructor(
    public texts: TextsService,
    private studentService: StudentService,
    private router: Router,
    private modalService: NgbModal,
    private storage: AngularFireStorage,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private  alertConfig: NgbAlertConfig,
    private toastr:  ToastrService) {
      this.formulario = this.formBuilder.group({
        // Datos de usuario
        // password: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]{6,18}/),
        //   ])],
        // password_confirm: ['', Validators.compose([Validators.required])],

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

      });
      // Obtenemos los parámetros de las rutas...
      this.activatedRoute.params.subscribe(params => {
        if ( params['id'] ) {
          this.student$ = this.studentService.getStudent(params['id']).valueChanges();
        }
      });
  }

  ngOnInit() {

  }



  update(student, registerModal) {
    this.modalMessage = '¿Deseas actualizar sus datos?';
    // El modal se invoca con una promesa que se resuelve si el modal es aceptado o se reachaza si es cerrado
    this.modalService.open(registerModal).result.then(() => {
      // Aquí se incluye la lógica cuando el modal ha sido aceptado

      // Si hay archivo se sube y luego actualizamos
      if (this.file) {
        this.uploadFile(this.file, student.uid).then((url) => {
          // Se asignan los valores del formulario al objeto student.
          this.assign(student, this.formulario.value);
          student.logo = url;
          this.studentService.updateStudent(student.uid, student)
          .then((result) => {
            this.toastr.success('Su información ha sido actualizada exitosamente!', '¡Éxito!');
          }).catch((err) => {
            this.toastr.error('¡Hubo un error al actualizar su información!', '¡Error!');
          });
        }).catch((err) => {
          this.toastr.error('¡Hubo un error al actualizar su información!', '¡Error!');
        });
      } else {
        // Se asignan los valores del formulario al objeto student.
        this.assign(student, this.formulario.value);
        this.studentService.updateStudent(student.uid, student)
        .then((result) => {
          this.toastr.success('Su información ha sido actualizada exitosamente!', '¡Éxito!');
        }).catch((err) => {
          this.toastr.error('¡Hubo un error al actualizar su información!', '¡Error!');
        });
      }
    }, (reason) => {
      // Si el usuario oprime cancelar
    });
  }

  actualizar(student) {
    this.isreadonly = !this.isreadonly;
    // Esto hace que los validators funcionen correctamente.
    // Además de actualizar resetear los valores del formulario al momento de cancelar.
    // Esto resetea el valor del formulario
    this.assign(this.formulario.value, student);
    this.formulario.reset(this.formulario.value);
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
    console.log('this.file :', this.file);
  }


  private uploadFile(file: File, id: string) {

    // The storage path
    // el tipo de archivo ${file.type.split('/')[1]}
    // Por el momento todo se guardará como png
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
        } else if ( objectToCopy[key] ) {
          object[key] = objectToCopy[key];
        }
      }
    }
  }

}
