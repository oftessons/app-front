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
  isDragging: boolean = false;
  podeImportar: boolean = false;

  constructor(private flashcardService: FlashcardService) {}

  ngOnInit(): void {
    let permissaoEncontrada = '';

    const usuarioJson =
      localStorage.getItem('usuario') ||
      localStorage.getItem('user') ||
      localStorage.getItem('currentUser');

    if (usuarioJson) {
      try {
        const usuarioObj = JSON.parse(usuarioJson);

        if (usuarioObj && usuarioObj.permissao) {
          permissaoEncontrada = usuarioObj.permissao;
        }
      } catch (e) {
        console.error('Erro ao ler JSON do usuário:', e);
      }
    }

    if (!permissaoEncontrada) {
      permissaoEncontrada =
        localStorage.getItem('permissao') || localStorage.getItem('role') || '';
    }

    if (permissaoEncontrada) {
      const p = permissaoEncontrada.toUpperCase();
      this.podeImportar = p.includes('ADMIN') || p.includes('PROFESSOR');
    } else {
      this.podeImportar = false;
    }
  }

  onStudyClick(): void {
    this.study.emit();
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.arquivoCsv = null;
    this.isDragging = false;
  }

  removerArquivo(): void {
    this.arquivoCsv = null;
    const fileInput = document.getElementById(
      'csvInputSubtema'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  baixarPlanilhaModelo(): void {
    const link = document.createElement('a');
    link.href = '../../../assets/docs/Planilha Modelo - Flashcards.csv';
    link.download = 'Planilha Modelo - Flashcards.csv';
    link.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.validarArquivo(file);
    }
  }

  onCsvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validarArquivo(input.files[0]);
    }
  }

  validarArquivo(file: File): void {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      this.arquivoCsv = file;
    } else {
      alert('Por favor, selecione apenas arquivos CSV.');
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
