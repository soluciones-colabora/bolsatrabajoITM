import { Component } from "@angular/core";
import { Joboffer } from "../../../interfaces/joboffer.interface";
import { Enterprise } from "../../../interfaces/enterprise.interface";
import { JobofferService } from "../../../services/joboffer.service";
import { EnterpriseService } from "../../../services/enterprise.service";
import { StudentService } from "../../../services/student.service";
import { AuthService } from "../../../services/auth.service";
import { TextsService } from "../../../services/texts.service";

import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, Validators, FormGroup, FormArrayName } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";

import { map, take, tap, finalize } from 'rxjs/operators';

declare var $: any;
@Component({
  selector: "app-joboffer-view",
  templateUrl: "./joboffer-view.component.html",
  styleUrls: ["./joboffer-view.component.scss"]
})
export class JobofferViewComponent {

  // public joboffer: Joboffer;
  public formulario: FormGroup;
  public success: boolean;
  public postMessage: string;
  mensaje_modal: string;

  public joboffer$: Observable<Joboffer>;
  public enterprise$: Observable<Enterprise>;
  public students$: Observable<any[]>;
  public user$: Observable<any>;

  public isPostulated: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private jobofferService: JobofferService,
    private enterpriseService: EnterpriseService,
    private studentService: StudentService,
    private authService: AuthService,
    private modalService: NgbModal,
    public txts: TextsService
  ) {
    // Primero se crea el formulario
    this.createform();
    this.activatedRoute.params.subscribe(params => {
      this.joboffer$ = this.jobofferService.getJoboffer(params["id"]).valueChanges().pipe(
        take(1),
        tap(joboffer => {
          // Filtramos para ver si el id fue válido
          if (!!joboffer) {
            this.user$ = this.authService.user.pipe(
              // take(1),
              tap(user => {
                this.isPostulated = joboffer.applicants.map(applicant => applicant.uid).includes(user.uid);
              })
            );
            this.students$ = this.studentService.getStudentsInArray(joboffer.applicants.map(applicant => applicant.uid));
            this.enterprise$ = this.enterpriseService.getEnterprise(joboffer.idEnterprise).valueChanges();
          } else {
            // Regresa página 404 not found
            console.log('No existe');
          }
        })
      );
    });
  }

  createform() {
    this.formulario = this.formBuilder.group({
      postulación: ["", Validators.required]
    });
  }

  postulate(joboffer: Joboffer, studentId, modalConfirmacion) {
    this.mensaje_modal = "¿Deseas postularte para esta oferta de trabajo?";
    const message = this.formulario.value.postulación;
    this.modalService.open(modalConfirmacion).result.then(() => {
        // El estudiante se postula.
        // Ya se ha postulado antes (sólo por protección)
        if (joboffer.applicants.map(applicant => applicant.uid).includes(studentId)) { return; }
        joboffer.applicants.push({uid: studentId, message: message});
        this.jobofferService.updateJoboffer(joboffer.uid, joboffer)
        .then((result) => {
          this.success = true;
        }).catch((err) => {
          console.log('err :', err);
          this.success = false;
        });
      },
      reason => {}
    );
  }

  downloadCV(value) {
    console.log('value :', value);
  }

  viewMessage(joboffer: Joboffer, studentId, modalMessage) {
    this.postMessage = joboffer.applicants.find(applicant => applicant.uid === studentId).message;
    this.modalService.open(modalMessage).result.then(() => {
      // Vemos el mensaje...
    },
    reason => {}
    );

  }

}
