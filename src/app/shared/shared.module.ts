import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectPadraoComponent } from './select-padrao/select-padrao.component';
import { InputPadraoComponent } from './input-padrao/input-padrao.component';
import { ImageResizeModule } from './image-resize/image-resize.module';

// material imports
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from '@angular/forms';
import { ModuloAulasComponent } from './modulo-aulas/modulo-aulas.component';
import { PlaylistModeComponent } from './playlist-mode/playlist-mode.component';

@NgModule({
  declarations: [
    SelectPadraoComponent,
    InputPadraoComponent,
    ModuloAulasComponent,
    PlaylistModeComponent
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
    InputPadraoComponent,
    ModuloAulasComponent,
    PlaylistModeComponent
  ]
})
export class SharedModule { }
