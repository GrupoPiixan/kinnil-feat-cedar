import { Component, OnInit } from '@angular/core';

// * Package.json
import pkg from '../../../../package.json';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  // * Viariable para guardar los datos del package.json
  public app = pkg;
  year: number = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
  }

}
