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
  styleUrls: ['./flashcards.component.css'],
})
export class FlashcardsComponent implements OnInit {
  listaDeTemas: TemaInfo[] = [];
  isLoading: boolean = true;

  constructor(
    private flashcardService: FlashcardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.flashcardService.getFlashcardsContador().subscribe({
      next: (dados) => {
        this.listaDeTemas = Object.values(Tema).map((tema) => {
          const temaInfo = dados.find((info) => info.tema === tema);
          const qtdFlashcards = temaInfo ? temaInfo.total || 0 : 0;
          const titulo = TemaDescricoes[tema] || 'Tema não encontrado';
          const rotaFormatada = (tema as string).toLowerCase();

          return {
            chave: tema as string,
            titulo,
            qtdFlashcards,
            rota: `/usuario/flashcards/${rotaFormatada}`,
          };
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  navigateToCadastro(): void {
    this.router.navigate(['/usuario/cadastro-flashcard']);
  }
}
