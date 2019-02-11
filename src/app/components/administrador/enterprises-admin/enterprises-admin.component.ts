import { Component, Inject, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Enterprise } from '../../../interfaces/enterprise.interface';
import { EnterpriseService } from '../../../services/enterprise.service';
import { JobofferService } from '../../../services/joboffer.service';
import { PaginationService } from '../../../services/pagination.service';
import { ToastrService } from 'ngx-toastr';

import { Observable } from 'rxjs';
import { map, take, tap, finalize, switchMap, flatMap } from "rxjs/operators";



@Component({
  selector: 'app-enterprises-admin',
  templateUrl: './enterprises-admin.component.html',
  styleUrls: ['./enterprises-admin.component.scss'],
  providers: [
    { provide: 'instance1', useClass: PaginationService },
    { provide: 'instance2', useClass: PaginationService }
  ]
})
export class EnterprisesAdminComponent implements OnInit {

  public index = 0;
  public pages = 5;
  // Observables de la DB.
  public activeEnterprises$: Observable<Enterprise[]>;
  public inactiveEnterprises$: Observable<Enterprise[]>;
  public suspendedEnterprises$: Observable<Enterprise[]>;

  // Elementos a mostrar como resultado del filtro de búsqueda.
  public activeEnterprises: Enterprise[];
  public inactiveEnterprises: Enterprise[];
  public suspendedEnterprises: Enterprise[];

  // Elementos Seleccionados
  public selectedActive = [];
  public selectedInactive = [];
  public selectedSuspended = [];

  // Variables de las alertas
  public enterprisePreview: Enterprise;

  constructor(
    @Inject('instance1') public page: PaginationService,
    @Inject('instance2') public page2: PaginationService,
    private modalService: NgbModal,
    private  toastr: ToastrService,
    private enterpriseService: EnterpriseService,
    private jobofferService: JobofferService
    ) {
      // this.page.reset();
      // this.page.init('users', 'createdOn', { reverse: true, equalTo : {field: 'role', value: 'enterprise'} });
      // this.page2.reset();
      // this.page2.init('users', 'createdOn', { reverse: true, status: 'pending', equalTo : {field: 'role', value: 'enterprise'} });
      this.inactiveEnterprises$ = this.enterpriseService.getInactiveEnterprises().pipe(
        tap(inactiveEnterprises => { this.inactiveEnterprises = inactiveEnterprises; })
      );
      this.activeEnterprises$ = this.enterpriseService.getActiveEnterprises().pipe(
        tap(activeEnterprises => { this.activeEnterprises = activeEnterprises; })
      );
      this.suspendedEnterprises$ = this.enterpriseService.getSuspendedEnterprises().pipe(
        tap(suspendedEnterprises => { this.suspendedEnterprises = suspendedEnterprises; })
      );

  }

  ngOnInit() {
    // this.activeEnterprises$ = this.page.data.pipe(
    //   tap(activeEnterprises => { this.activeEnterprises = activeEnterprises; })
    // );
    // this.inactiveEnterprises$ = this.page2.data.pipe(
    //   tap(inactiveEnterprises => { this.inactiveEnterprises = inactiveEnterprises; })
    // );

  }

  populateCollection (index) {
    if (index === (this.index + 5)) {
      this.index = index;
      return;
    }
    setTimeout(() => {
      return this.jobofferService.createSomething({'index': index})
      .then((result) => {
        return this.populateCollection(++index);
      }).catch((err) => {
        console.log('err :', err);
      });
    }, 1000);
  }

  setPage( pageInfo ) {
    if ((pageInfo.offset === this.pages - 1) || (pageInfo.offset === this.pages - 2)) {
      this.page.more();
      this.pages += 5;
    }
  }

  setPage2( pageInfo ) {
    // if ((pageInfo.offset === this.pages - 1) || (pageInfo.offset === this.pages - 2)) {
    //   this.page.more();
    //   this.pages += 5;
    // }
    this.page2.more();
  }

  getMore() {
    this.page.more();
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
    if (!Array.isArray(selectedItem)) { this.enterprisePreview = selectedItem; }

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
        return this.enterpriseService.updateEnterprise(selectedItem.uid, {status : 'active'});
      case 'activate':
        return this.enterpriseService.updateEnterprise(selectedItem.uid, {status : 'active'});
      case 'suspend':
        return this.enterpriseService.updateEnterprise(selectedItem.uid, {status : 'suspended'});
      case 'delete':
        return this.enterpriseService.updateEnterprise(selectedItem.uid, {status : 'deleted'});
      case 'activateBatch':
        return this.enterpriseService.setActiveEnterprises(selectedItem);
      case 'approveBatch':
        return this.enterpriseService.setActiveEnterprises(selectedItem);
      case 'deleteBatch':
        return this.enterpriseService.deleteEnterprises(selectedItem);
      default:
        return new Promise((resolve, reject) => {
          resolve();
        });
    }
  }

  private setToastr(action: string) {
    switch (action) {
      case 'approve':
        this.toastr.success('¡La empresa ha sido aprobada exitosamente!', '¡Éxito!');
        break;
      case 'activate':
        this.toastr.success('¡La empresa ha sido activada exitosamente!', '¡Éxito!');
        break;
      case 'suspend':
        this.toastr.success('¡La empresa ha sido suspendida exitosamente!', '¡Éxito!');
        break;
      case 'delete':
        this.toastr.success('¡La empresa ha sido eliminada exitosamente!', '¡Éxito!');
        break;
      case 'deleteBatch':
        this.toastr.success('¡Las empresas han sido eliminadas exitosamente!', '¡Éxito!');
        break;
      case 'approveBatch':
        this.toastr.success('¡Las empresas han sido aprobadas exitosamente!', '¡Éxito!');
        break;
      case 'activateBatch':
        this.toastr.success('¡Las empresas han sido activadas exitosamente!', '¡Éxito!');
        break;
      case 'fail':
        this.toastr.error('Hubo un error, por favor intentelo nuevamente', '¡Error!');
        break;
      default:
        break;
    }
  }

  onSearch(event, table, enterprises: Enterprise[] | null) {
    const searchFilter = event.target.value;
    if (table === 'Active') {
      this.activeEnterprises =  this.filterSearch(searchFilter, enterprises);
    } else if (table === 'Inactive') {
      this.inactiveEnterprises =  this.filterSearch(searchFilter, enterprises);
    } else if (table === 'Suspended') {
      this.suspendedEnterprises =  this.filterSearch(searchFilter, enterprises);
    }
  }

  // Filtro para el input de búsqueda.
  private filterSearch(searchFilter, enterprises: Enterprise[] | null): Enterprise[] | null {
    if (enterprises === null || enterprises[0] === null) {
      return [];
    }
    if (!searchFilter) {
      return enterprises;
    }
    const filtered = [];
    enterprises.forEach(enterprise => {
      if (
        enterprise.comercialName
          .toLowerCase()
          .includes(searchFilter.toLowerCase()) ||
        enterprise.email
          .toLowerCase()
          .includes(searchFilter.toLowerCase())
      ) {
        filtered.push(enterprise);
      }
    });
    return filtered.length > 0 ? filtered : [];
  }

}
