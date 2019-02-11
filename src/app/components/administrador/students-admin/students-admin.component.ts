import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Student } from '../../../interfaces/student.interface';
import { StudentService } from '../../../services/student.service';
import { TextsService } from '../../../services/texts.service';
import { ToastrService } from 'ngx-toastr';

import { Observable } from 'rxjs';
import { map, take, tap, finalize, switchMap, flatMap } from "rxjs/operators";
@Component({
  selector: 'app-students-admin',
  templateUrl: './students-admin.component.html',
  styleUrls: ['./students-admin.component.scss']
})
export class StudentsAdminComponent {

  // Observables de la DB.
  public activeStudents$: Observable<Student[]>;
  public inactiveStudents$: Observable<Student[]>;
  public suspendedStudents$: Observable<Student[]>;

  // Elementos a mostrar como resultado del filtro de búsqueda.
  public activeStudents: Student[];
  public inactiveStudents: Student[];
  public suspendedStudents: Student[];

  // Elementos Seleccionados
  public selectedActive = [];
  public selectedInactive = [];
  public selectedSuspended = [];

  // Variables de las alertas
  public studentPreview: Student;
  public graduadoPreview: string;

  constructor(
    private modalService: NgbModal,
    private studentService: StudentService,
    private toastr: ToastrService,
    public txts: TextsService
    ) {
      this.inactiveStudents$ = this.studentService.getInactiveStudents().pipe(
        tap(inactiveStudents => { this.inactiveStudents = inactiveStudents; })
      );
      this.activeStudents$ = this.studentService.getActiveStudents().pipe(
        tap(activeStudents => { this.activeStudents = activeStudents; })
      );
      this.suspendedStudents$ = this.studentService.getSuspendedStudents().pipe(
        tap(suspendedStudents => { this.suspendedStudents = suspendedStudents; })
      );
  }

  onSelect({ selected }, table: string) {
    if (table === 'Active') {
      this.selectedActive.splice(0, this.selectedActive.length);
      this.selectedActive.push(...selected);
    } else if (table === 'Inactive') {
      this.selectedInactive.splice(0, this.selectedInactive.length);
      this.selectedInactive.push(...selected);
    } else if (table === 'Suspended') {
      this.selectedSuspended.splice(0, this.selectedSuspended.length);
      this.selectedSuspended.push(...selected);
    }
  }

  onAction(selectedItem: any, action: string, table: string, modal: any) {
    // Desplegamos el modal correspondiente...
    if (!Array.isArray(selectedItem)) {
      this.studentPreview = selectedItem;
      this.graduadoPreview = this.studentPreview.isGraduated ? 'Graduado' : 'No graduado';
    }

    // Se abre el modal correspondiente ...
    this.modalService.open(modal).result.then(() => {
      // Si lo aceptan entonces procedemos según la acción.

      // Reiniciamos los valores seleccionados ...
      if (table === 'Active' && this.selectedActive.length) { this.selectedActive = [];
      } else if (table === 'Inactive' && this.selectedInactive.length) { this.selectedInactive = [];
      } else if (table === 'Suspended' && this.selectedSuspended.length) { this.selectedSuspended = []; }

      this.switchAction(selectedItem, action).then(() => {
        this.setToastr(action);
      }).catch((err) => {
        this.setToastr('fail');
      });
    }, (reason) => {
      // Si el usuario oprime cancelar
      if (table === 'Active' && this.selectedActive.length) { this.selectedActive = [];
      } else if (table === 'Inactive' && this.selectedInactive.length) { this.selectedInactive = [];
      } else if (table === 'Suspended' && this.selectedSuspended.length) { this.selectedSuspended = []; }
    });
  }

  private switchAction(selectedItem: any, action: string): Promise<void> {
    switch (action) {
      case 'approve':
        return this.studentService.updateStudent(selectedItem.uid, {status : 'active'});
      case 'activate':
        return this.studentService.updateStudent(selectedItem.uid, {status : 'active'});
      case 'suspend':
        return this.studentService.updateStudent(selectedItem.uid, {status : 'suspended'});
      case 'delete':
        return this.studentService.updateStudent(selectedItem.uid, {status : 'deleted'});
      case 'activateBatch':
        return this.studentService.setActiveStudents(selectedItem);
      case 'approveBatch':
        return this.studentService.setActiveStudents(selectedItem);
      case 'deleteBatch':
        return this.studentService.deleteStudents(selectedItem);
      default:
        return new Promise((resolve, reject) => {
          resolve();
        });
    }
  }

  private setToastr(action: string) {
    switch (action) {
      case 'approve':
        this.toastr.success('¡El estudiante ha sido aprobado exitosamente!', '¡Éxito!');
        break;
      case 'activate':
        this.toastr.success('¡El estudiante ha sido activado exitosamente!', '¡Éxito!');
        break;
      case 'suspend':
        this.toastr.success('¡El estudiante ha sido suspendido exitosamente!', '¡Éxito!');
        break;
      case 'delete':
        this.toastr.success('¡El estudiante ha sido eliminado exitosamente!', '¡Éxito!');
        break;
      case 'deleteBatch':
        this.toastr.success('¡Los estudiantes han sido eliminados exitosamente!', '¡Éxito!');
        break;
      case 'approveBatch':
        this.toastr.success('¡Los estudiantes han sido aprobados exitosamente!', '¡Éxito!');
        break;
      case 'activateBatch':
        this.toastr.success('¡Los estudiantes han sido activados exitosamente!', '¡Éxito!');
        break;
      case 'fail':
        this.toastr.error('Hubo un error, por favor intentelo nuevamente', '¡Error!');
        break;
      default:
        break;
    }
  }

  onSearch(event, table, students: Student[] | null) {
    const searchFilter = event.target.value;
    if (table === 'Active') {
      this.activeStudents =  this.filterSearch(searchFilter, students);
    } else if (table === 'Inactive') {
      this.inactiveStudents =  this.filterSearch(searchFilter, students);
    } else if (table === 'Suspended') {
      this.suspendedStudents =  this.filterSearch(searchFilter, students);
    }
  }

  // Filtro para el input de búsqueda.
  private filterSearch(searchFilter, students: Student[] | null): Student[] | null {
    if (students === null || students[0] === null) {
      return [];
    }
    if (!searchFilter) {
      return students;
    }
    const filtered = [];
    students.forEach(student => {
      if (
        student.firstName.concat(student.middleName.concat(student.lastName))
          .toLowerCase()
          .includes(searchFilter.toLowerCase()) ||
        student.email
          .toLowerCase()
          .includes(searchFilter.toLowerCase()) ||
        student.idStudent
          .toLowerCase()
          .includes(searchFilter.toLowerCase())
      ) {
        filtered.push(student);
      }
    });
    return filtered.length > 0 ? filtered : [];
  }
}


