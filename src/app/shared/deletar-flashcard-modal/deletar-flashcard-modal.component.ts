import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FlashcardService } from 'src/app/services/flashcards.service';

type ModalState = 'confirmation' | 'success';

@Component({
  selector: 'app-deletar-flashcard-modal',
  templateUrl: './deletar-flashcard-modal.component.html',
  styleUrls: ['./deletar-flashcard-modal.component.css']
})
export class DeletarFlashcardModalComponent {

  @Input() cardId!: number;
  
  public estado: ModalState = 'confirmation';
  public isLoading = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() finalClose = new EventEmitter<void>();

  constructor(private flashcardService: FlashcardService) { }

  onCancelClick() {
    this.close.emit();
  }

  onConfirmClick() {
    this.isLoading = true;

    this.flashcardService.deleteFlashcard(this.cardId).subscribe({
      next: () => {
        this.isLoading = false;
        this.estado = 'success';
      },
      error: () => {
        this.isLoading = false;
        this.close.emit();
      }
    });
  }

  onFinalCloseClick() {
    this.finalClose.emit();
  }

}