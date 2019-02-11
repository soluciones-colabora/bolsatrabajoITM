import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, AbstractControl, FormArray } from '@angular/forms';
import { Joboffer } from '../../../interfaces/joboffer.interface';
import { JobofferService } from '../../../services/joboffer.service';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TextsService } from '../../../services/texts.service';
import { ToastrService } from 'ngx-toastr';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';


import { Observable } from 'rxjs';
import { map, take, tap, finalize } from 'rxjs/operators';
import { text } from '@angular/core/src/render3/instructions';
@Component({
  selector: 'app-joboffer-edit',
  templateUrl: './joboffer-edit.component.html',
  styleUrls: ['./joboffer-edit.component.scss']
})
export class JobofferEditComponent implements OnInit {

  public formulario: FormGroup;
  public modalMessage: string;
  public messageAlert: string;
  public typeAlert: string;
  public isreadonly = true;
  public joboffer$: Observable<Joboffer>;

  constructor(
    private jobofferService: JobofferService,
    public texts: TextsService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService) {
      this.formulario = this.formBuilder.group({
        // Datos del puesto:
        position:       ['', Validators.required],
        description:    ['', Validators.required],
        economicType:   ['', Validators.required],
        economicAmount: ['', Validators.required],
        vacantNumber:   ['', Validators.required],
        weeklyHours:    ['', Validators.required],
        // Perfil deseado:
        aptitudes:    new FormArray([
          new FormControl('', Validators.required)
        ]),
        bachelors:  new FormArray([
          // new FormControl('', Validators.required)
        ]),
        experience:   ['', Validators.required],
        written:      [''],
        spoken:       [''],
        translation:  [''],
      });
      this.activatedRoute.params.subscribe(params => {
        if ( params['id'] ) {
          this.joboffer$ = this.jobofferService.getJoboffer(params['id']).valueChanges();
        }
      });
  }

  ngOnInit() {
  }

  update(joboffer, registerModal) {
    this.modalMessage = '¿Deseas actualizar sus datos?';
    // El modal se invoca con una promesa que se resuelve si el modal es aceptado o se reachaza si es cerrado

    this.modalService.open(registerModal).result.then(() => {
      // Aquí se incluye la lógica cuando el modal ha sido aceptado

      // Si hay archivo se sube y luego actualizamos

      // Se asignan los valores del formulario al objeto joboffer.
      this.assign(joboffer, this.formulario.value);
      this.jobofferService.updateJoboffer(joboffer.uid, joboffer)
      .then((result) => {
        this.toastr.success('Su información ha sido actualizada exitosamente!', '¡Éxito!');
      }).catch((err) => {
        this.toastr.error('¡Hubo un error al actualizar su información!', '¡Error!');
      });

    }, (reason) => {
      // Si el usuario oprime cancelar
    });
  }

  actualizar(joboffer: Joboffer) {
    // Esto hace que los validators funcionen correctamente.
    // Además de actualizar resetear los valores del formulario al momento de cancelar.
    // Esto resetea el valor del formulario
    this.isreadonly = !this.isreadonly;
    while (this.formulario.controls['bachelors'].value.length !== joboffer.bachelors.length) {
      if (this.formulario.controls['bachelors'].value.length < joboffer.bachelors.length) {
        this.agregarcarrera();
      } else {
        this.eliminarcarrera(0);
      }
    }
    while (this.formulario.controls['aptitudes'].value.length !== joboffer.aptitudes.length) {
      if (this.formulario.controls['aptitudes'].value.length < joboffer.aptitudes.length) {
        this.agregaraptitud();
      } else {
        this.eliminaraptitud(0);
      }
    }
    this.formulario.controls['bachelors'].setValue(joboffer.bachelors);
    this.formulario.controls['aptitudes'].setValue(joboffer.aptitudes);
    this.assign(this.formulario.value, joboffer);
    this.formulario.reset(this.formulario.value);
  }

  agregarcarrera(name?: string) {
    const value = name ? name : '';
    (<FormArray>this.formulario.controls['bachelors']).push(
      new FormControl(value, Validators.required)
    );
  }

  eliminarcarrera(index: number) {
    (<FormArray>this.formulario.controls['bachelors']).removeAt(index);
  }

  agregaraptitud() {
    (<FormArray>this.formulario.controls['aptitudes']).push(
      new FormControl('', Validators.required)
    );
  }

  eliminaraptitud(index: number) {
    (<FormArray>this.formulario.controls['aptitudes']).removeAt(index);
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
        } else if ( objectToCopy[key] !== undefined) {
          object[key] = objectToCopy[key];
        }
      }
    }
  }

}
