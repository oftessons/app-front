import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectPadraoComponent } from './select-padrao/select-padrao.component';
import { InputPadraoComponent } from './input-padrao/input-padrao.component';
import { ImageResizeModule } from './image-resize/image-resize.module';

// material imports
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SelectPadraoComponent,
    InputPadraoComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    ImageResizeModule,
    FormsModule,
  ],
  exports: [
    SelectPadraoComponent,
    ImageResizeModule,
    InputPadraoComponent
  ]
})
export class SharedModule { }
