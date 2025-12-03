import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectPadraoComponent } from './select-padrao/select-padrao.component';
import { InputPadraoComponent } from './input-padrao/input-padrao.component';
import { ImageResizeModule } from './image-resize/image-resize.module';
import { LottieModule } from 'ngx-lottie';

// material imports
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ModuloAulasComponent } from './modulo-aulas/modulo-aulas.component';
import { PlaylistModeComponent } from './playlist-mode/playlist-mode.component';
import { MultiploSelectComponent } from './multiplo-select/multiplo-select.component';
import { ModalComponent } from './modal/modal.component';
import { CardPlanoComponent } from './card-plano/card-plano.component';
import { AppRoutingModule } from '../app-routing.module';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';
import { PageEmDesenvolvimentoComponent } from './page-em-desenvolvimento/page-em-desenvolvimento.component';
import { HappyMessagePopupComponent } from './happy-message-popup/happy-message-popup.component';
import { FlashcardsTemasCardsComponent } from './flashcards-temas-cards/flashcards-temas-cards.component';
import { FlashcardsSubtemasComponent } from './flashcards-subtemas/flashcards-subtemas.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlashcardModalComponent } from './flashcard-modal/flashcard-modal.component';
import { DeletarFlashcardModalComponent } from './deletar-flashcard-modal/deletar-flashcard-modal.component';
import { ModalTrilhaComponent } from './modal-trilha/modal-trilha.component';
import { ModalEditarSemanaTrilhaComponent } from './modal-editar-semana-trilha/modal-editar-semana-trilha.component';
import { ModalPadraoComponent } from './modal-padrao/modal-padrao.component';

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
    FlashcardModalComponent,
    FlashcardsSubtemasComponent,
    DeletarFlashcardModalComponent,
    ModalTrilhaComponent,
    ModalEditarSemanaTrilhaComponent,
    HappyMessagePopupComponent,
    ModalPadraoComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    ImageResizeModule,
    FormsModule,
    AppRoutingModule,
    MatProgressBarModule,
    LottieModule,
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
    HappyMessagePopupComponent,
    FlashcardsTemasCardsComponent,
    FlashcardsSubtemasComponent,
    FlashcardModalComponent,
    ModalTrilhaComponent,
    ModalPadraoComponent,
  ],
  entryComponents: [ModalTrilhaComponent, ModalPadraoComponent],
})
export class SharedModule {}
