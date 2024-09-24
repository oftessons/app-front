import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectPadraoComponent } from './select-padrao/select-padrao.component';


// material imports
import { MatIconModule } from "@angular/material/icon";



@NgModule({
  declarations: [
    SelectPadraoComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ],
  exports: [
    SelectPadraoComponent
  ]
})
export class SharedModule { }
