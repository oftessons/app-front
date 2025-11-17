import { Component, OnInit } from '@angular/core';
import { Tema } from '../page-questoes/enums/tema';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { FlashcardService } from 'src/app/services/flashcards.service';
import { Router } from '@angular/router';

export interface TemaInfo {
  chave?: string;
  titulo: string;
  qtdFlashcards: number;
  rota: string;
}

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css']
})
export class FlashcardsComponent implements OnInit {
  listaDeTemas: TemaInfo[] = [];
  isModalOpen: boolean = false;
  temaSelecionado: string = '';
  arquivoCsv: File | null = null;
  isImportando: boolean = false;

  constructor(private flashcardService: FlashcardService, private router: Router) {}

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.temaSelecionado = '';
    this.arquivoCsv = null;
  }

  navigateToCadastro(): void {
    this.router.navigate(['/usuario/cadastro-flashcard']);
  }

  ngOnInit(): void {
    this.flashcardService.getFlashcardsContador().subscribe(
      dados => {
        this.listaDeTemas = Object.values(Tema).map(tema => {
          const temaInfo = dados.find(info => info.tema === tema);
          const qtdFlashcards = temaInfo ? (temaInfo.total || 0) : 0;
          const titulo = TemaDescricoes[tema] || 'Tema não encontrado';
          const rotaFormatada = (tema as string).toLowerCase();

          return {
            chave: tema as string,
            titulo: titulo,
            qtdFlashcards: qtdFlashcards,
            rota: `/usuario/flashcards/${rotaFormatada}`
          };
        });
      }
    );
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
    if (!this.temaSelecionado || !this.arquivoCsv) {
      return;
    }

    this.isImportando = true;

    this.flashcardService.importarFlashcardsCsv(this.temaSelecionado, this.arquivoCsv).subscribe({
      next: res => {
        console.log('Importação realizada com sucesso:', res);
        this.isImportando = false;
        this.closeModal();
      },
      error: err => {
        console.error('Erro ao importar flashcards:', err);
        this.isImportando = false;
      }
    });
  }
}
