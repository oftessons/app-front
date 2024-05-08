import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TemplateRoutingModule } from './template-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';


@NgModule({
  declarations: [
    NavbarComponent
  ],
  imports: [
    CommonModule,
    TemplateRoutingModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule, 
    MatListModule
  ],
  exports:[
    NavbarComponent
  ]
})
export class TemplateModule { }
