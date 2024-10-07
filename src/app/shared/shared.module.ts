import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectPadraoComponent } from './select-padrao/select-padrao.component';
import { ImageResizeModule } from './image-resize/image-resize.module';


// material imports
import { MatIconModule } from "@angular/material/icon";



@NgModule({
  declarations: [
    SelectPadraoComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    ImageResizeModule
  ],
  exports: [
    SelectPadraoComponent,
    ImageResizeModule
  ]
})
export class SharedModule { }
