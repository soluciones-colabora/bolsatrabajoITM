import { Component, OnInit } from '@angular/core';
import { Joboffer } from '../../../interfaces/joboffer.interface';
import { JobofferService } from '../../../services/joboffer.service';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-joboffer-list',
  templateUrl: './joboffer-list.component.html',
  styleUrls: ['./joboffer-list.component.scss']
})
export class JobofferListComponent implements OnInit {
  selected = [];
  public joboffers$: Observable<Joboffer[]>;
  public emptyMessage = {
    emptyMessage: 'No hay ofertas para mostrar...',
    // Footer total message
    totalMessage: 'total'
  };

  constructor( private jobofferService: JobofferService,
    private activatedRoute: ActivatedRoute,
    private router: Router ) {
    this.activatedRoute.params.subscribe(params => {
      // Siempre va a haber el id, no hace falta comprobación ...
      this.joboffers$ = this.jobofferService.getData(params['id']);
      // if ( params['id'] !== 'nuevo') {
      //   // this.enterpriseO = this.enterpriseService.getEnterprise(params['id']).valueChanges();
      // }
    });
  }

  ngOnInit() {
  }

  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event) {
    // console.log('Activate Event', event);
  }

  add() {
    // this.selected.push(this.rows[1], this.rows[3]);
  }

  update() {
    // this.selected = [ this.rows[1], this.rows[3] ];
  }

  remove(id: string) {
    this.selected = [];
    console.log('id :', id);
    this.jobofferService.deleteJoboffer(id);
    console.log('removido el elemento');
  }

  goToOffer(id: string) {
    this.router.navigate(['/joboffer', id]);
  }

  editOffer(id: string) {
    this.router.navigate(['/edit/joboffer', id]);
  }

  updateFilter(event) {
    console.log('updateFilter', event);
  }

}
