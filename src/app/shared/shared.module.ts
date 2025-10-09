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
import { MultiploSelectComponent } from './multiplo-select/multiplo-select.component';
import { ModalComponent } from './modal/modal.component';
import { CardPlanoComponent } from './card-plano/card-plano.component';
import { AppRoutingModule } from '../app-routing.module';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';
import { PageEmDesenvolvimentoComponent } from './page-em-desenvolvimento/page-em-desenvolvimento.component';
import { FlashcardsTemasCardsComponent } from './flashcards-temas-cards/flashcards-temas-cards.component';
import { FlashcardsSubtemasComponent } from './flashcards-subtemas/flashcards-subtemas.component';
import { MatProgressBarModule } from "@angular/material/progress-bar";

@NgModule({
  declarations: [
    SelectPadraoComponent,
    InputPadraoComponent,
    ModuloAulasComponent,
    PlaylistModeComponent,
    MultiploSelectComponent,
    ModalComponent,
    CardPlanoComponent,
    ModalDeleteComponent,
    PageEmDesenvolvimentoComponent,
    FlashcardsTemasCardsComponent,
    FlashcardsSubtemasComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    ImageResizeModule,
    FormsModule,
    AppRoutingModule,
    MatProgressBarModule
],
  exports: [
    SelectPadraoComponent,
    ImageResizeModule,
    InputPadraoComponent,
    ModuloAulasComponent,
    PlaylistModeComponent,
    MultiploSelectComponent,
    ModalComponent,
    CardPlanoComponent,
    PageEmDesenvolvimentoComponent,
    FlashcardsTemasCardsComponent,
    FlashcardsSubtemasComponent,
  ]
})
export class SharedModule { }
