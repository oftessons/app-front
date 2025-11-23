import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FlashcardService } from 'src/app/services/flashcards.service';

@Component({
  selector: 'app-flashcards-subtemas',
  templateUrl: './flashcards-subtemas.component.html',
  styleUrls: ['./flashcards-subtemas.component.css'],
})
export class FlashcardsSubtemasComponent implements OnInit {
  @Input() subtema: string = 'Subtema';
  @Input() chave: string = '';
  @Input() chaveSubtema: string = '';
  @Input() porcentagem: number = 0;
  @Input() cards_estudados: number = 0;
  @Input() cards_total: number = 12;

  @Output() study = new EventEmitter<void>();

  isModalOpen: boolean = false;
  arquivoCsv: File | null = null;
  isImportando: boolean = false;

  constructor(private flashcardService: FlashcardService) {}

  ngOnInit(): void {}

  onStudyClick(): void {
    this.study.emit();
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.arquivoCsv = null;
  }

  onCsvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.arquivoCsv = input.files[0];
    } else {
      this.arquivoCsv = null;
    }
  }

  importarFlashcards(): void {
    if (!this.arquivoCsv || !this.chave || !this.chaveSubtema) {
      return;
    }

    this.isImportando = true;

    this.flashcardService
      .importarFlashcardsCsv(this.chave, this.chaveSubtema, this.arquivoCsv)
      .subscribe({
        next: () => {
          this.isImportando = false;
          this.closeModal();
        },
        error: () => {
          this.isImportando = false;
        },
      });
  }
}
