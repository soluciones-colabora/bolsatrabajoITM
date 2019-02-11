import { Component, OnInit } from '@angular/core';
import { Joboffer } from '../../../interfaces/joboffer.interface';
import { JobofferService } from '../../../services/joboffer.service';
import { EnterpriseService } from '../../../services/enterprise.service';
import { TextsService } from '../../../services/texts.service';

import { Observable, of } from "rxjs";
import { map, take, tap, finalize, switchMap, flatMap } from "rxjs/operators";
import { combineLatest } from "rxjs/observable/combineLatest";

@Component({
  selector: "app-joboffer-main",
  templateUrl: "./joboffer-main.component.html",
  styleUrls: ["./joboffer-main.component.scss"]
})
export class JobofferMainComponent implements OnInit {
  public joboffers$: Observable<Joboffer[]>;
  public selectedBachelor: string;
  public searchFilter: string;
  p: any;

  constructor(
  public texts: TextsService,
  private jobofferService: JobofferService,
  private enterpriseService: EnterpriseService) {
    this.joboffers$ = this.jobofferService.getData().pipe(
      map(joboffers => {
        if (joboffers.length !== 0) {
          return joboffers.map(joboffer => {
            return this.enterpriseService.getEnterprise(joboffer.idEnterprise).valueChanges().pipe(
              map(enterprise => Object.assign({}, {enterpriseLogo: enterprise.logo, enterpriseName: enterprise.comercialName, ...joboffer}))
            );
          });
        } else { return of(null); }
      }),
      flatMap(observables => combineLatest(observables))
    );
  }

  ngOnInit() {}

  // loadPage(page = 1) {
  //   let joboffersPagination: any;
  //     console.log(this.latestDoc);
  //   if (page == 1) {
  //      joboffersPagination = this.jobofferService.pagination(this.Itemspage, page, true);
  //   } else {
  //      joboffersPagination = this.jobofferService.pagination(this.Itemspage, page, false, this.latestDoc);
  //   }
  //   if (page !== this.previousPage) {
  //     this.previousPage = page;
  //     this.joboffers$ = joboffersPagination.valueChanges().pipe(
  //       map(joboffers => {
  //        this.latestDoc = joboffers[joboffers.length - 1];
  //         return joboffers.map(joboffer => {
  //           return this.enterpriseService.getEnterprise(joboffer.idEnterprise).valueChanges().pipe(
  //             map(enterprise => Object.assign({},
  //  {enterpriseLogo: enterprise.logo, enterpriseName: enterprise.comercialName, ...joboffer}))
  //           );
  //         });
  //       }),
  //       flatMap(observables => combineLatest(observables))
  //     );
  //   }
  // }

  filter(joboffers: Joboffer[]): Joboffer[] {
    return this.filterSearch(this.filterBachelor(joboffers));
  }

  // Filtro para el input de búsqueda.
  private filterSearch(joboffers: Joboffer[] | null): Joboffer[] | null {
    if (joboffers === null || joboffers[0] === null) {
      return null;
    }
    if (!this.searchFilter) {
      return joboffers;
    }
    const filtered = [];
    joboffers.forEach(joboffer => {
      if (
        joboffer.enterpriseName
          .toLowerCase()
          .includes(this.searchFilter.toLowerCase()) ||
        joboffer.position
          .toLowerCase()
          .includes(this.searchFilter.toLowerCase())
      ) {
        filtered.push(joboffer);
      }
    });
    return filtered.length > 0 ? filtered : null;
  }

  // Filtro para la carrera de egreso.
  private filterBachelor(joboffers: Joboffer[] | null): Joboffer[] | null {
    if (joboffers === null || joboffers[0] === null) {
      return null;
    }
    if (!this.selectedBachelor) {
      return joboffers;
    }
    const filtered = [];
    joboffers.forEach(joboffer => {
      if (joboffer.bachelors.includes(this.selectedBachelor)) {
        filtered.push(joboffer);
      }
    });
    return filtered.length > 0 ? filtered : null;
  }
}
