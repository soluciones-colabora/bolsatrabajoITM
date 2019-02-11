import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Enterprise } from '../../../interfaces/enterprise.interface';
import { EnterpriseService } from '../../../services/enterprise.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, take, tap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-enterpriseprofile',
  templateUrl: './enterprise-profile.component.html',
  styleUrls: ['./enterprise-profile.component.scss']
})
export class EnterpriseProfileComponent implements OnInit {

  public enterprise$: Observable<Enterprise>;
  public modalMessage: string;
  public messageAlert: string;
  public typeAlert: string;
  public isreadonly = true;
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

  constructor(private enterpriseService: EnterpriseService,
    private storage: AngularFireStorage,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private rutaURL: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService) {
      this.formulario = this.formBuilder.group({
        // Hay que agregrar verificación si existen usuarios:

        // password: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]{6,18}/)])],
        // password_confirm: ['', Validators.compose([Validators.required])],

        // Datos contacto
        firstName:      ['', Validators.required],
        lastName:       ['', Validators.required],
        middleName:     ['', Validators.required],
        job:            ['', Validators.required],
        department:     ['', Validators.required],
        contactPhone:   ['', Validators.compose([Validators.required, Validators.pattern(/^[0-9]{8,10}/), Validators.maxLength(10)])],
        contactAddress: ['', Validators.required],

        // Datos de la empresa
        comercialName:  ['', Validators.required],
        bussinessName:  ['', Validators.required],
        bussinessPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,10}/), Validators.maxLength(10)]],
        description:    ['', Validators.required],
        bussinessTurn:  ['', Validators.required],
        logo:           [''],
        // tslint:disable-next-line:max-line-length
        RFC: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z]{4}[0-9]{6}[a-zA-Z0-9]{3}/), Validators.maxLength(13)])],
        webURL: ['', Validators.compose([
          Validators.pattern(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)])],

        // Dirección de la empresa
        mainStreet:   ['', Validators.required],
        crossings:    ['', Validators.required],
        postalCode:   ['', Validators.compose([Validators.required, Validators.pattern(/^[0-9]{5}/)])],
        city:         ['', Validators.required],
        municipality: ['', Validators.required],
        state:        ['', Validators.required],
      });
      // Obtenemos los parámetros de las rutas...
      this.activatedRoute.params.subscribe(params => {
        if ( params['id'] ) {
          this.enterprise$ = this.enterpriseService.getEnterprise(params['id']).valueChanges();
        }
      });
  }

  ngOnInit() {

  }

  update(enterprise, registerModal) {
    this.modalMessage = '¿Deseas actualizar sus datos?';
    // El modal se invoca con una promesa que se resuelve si el modal es aceptado o se reachaza si es cerrado

    this.modalService.open(registerModal).result.then(() => {
      // Aquí se incluye la lógica cuando el modal ha sido aceptado

      // Si hay archivo se sube y luego actualizamos
      if (this.file) {
        this.uploadFile(this.file, enterprise.uid).then((url) => {
          // Se asignan los valores del formulario al objeto enterprise.
          this.assign(enterprise, this.formulario.value);
          enterprise.logo = url;
          this.enterpriseService.updateEnterprise(enterprise.uid, enterprise)
          .then((result) => {
            this.toastr.success('Su información ha sido actualizada exitosamente!', '¡Éxito!');
          }).catch((err) => {
            this.toastr.error('¡Hubo un error al actualizar su información!', '¡Error!');
          });
        }).catch((err) => {
          this.toastr.error('¡Hubo un error al actualizar su información!', '¡Error!');
        });
      } else {
        // Se asignan los valores del formulario al objeto enterprise.
        this.assign(enterprise, this.formulario.value);
        this.enterpriseService.updateEnterprise(enterprise.uid, enterprise)
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


  actualizar(enterprise) {
    this.isreadonly = !this.isreadonly;
    // Esto hace que los validators funcionen correctamente.
    // Además de actualizar resetear los valores del formulario al momento de cancelar.
    // Esto resetea el valor del formulario
    this.assign(this.formulario.value, enterprise);
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
        } else if ( objectToCopy[key]) {
          object[key] = objectToCopy[key];
        }
      }
    }
  }

}
