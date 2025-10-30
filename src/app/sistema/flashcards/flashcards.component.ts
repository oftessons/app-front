import { Component, OnInit } from '@angular/core';
import { Tema } from '../page-questoes/enums/tema';  // Importando o enum Tema
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { FlashcardService } from 'src/app/services/flashcards.service';

export interface TemaInfo {
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

  constructor(private flashcardService: FlashcardService) { }

  ngOnInit(): void {
    this.flashcardService.getFlashcardsContador().subscribe(
      (dados) => {
        console.log(dados);
        
        this.listaDeTemas = Object.values(Tema).map(tema => {
          const temaInfo = dados.find(info => info.tema === tema);
          const qtdFlashcards = temaInfo ? (temaInfo.total || 0) : 0;
          const titulo = TemaDescricoes[tema] || 'Tema não encontrado';
          const rotaFormatada = tema.toLowerCase();

          return {
            titulo: titulo,
            qtdFlashcards: qtdFlashcards,
            rota: `/usuario/flashcards/${rotaFormatada}`
          };
        });
      },
      (error) => {
        console.log('Erro ao buscar flashcards: ', error);
      }
    );
  }

}
