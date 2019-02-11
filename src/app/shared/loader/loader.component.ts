import { Component, OnInit } from '@angular/core';
import {NgbProgressbarConfig} from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  constructor(config: NgbProgressbarConfig) {
    config.max = 100;
    config.striped = true;
    config.animated = true;
    config.height = '20px';
  }

  ngOnInit() {
  }

}
