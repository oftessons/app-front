import { Component, OnInit } from '@angular/core';
import { Tema } from '../page-questoes/enums/tema';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';

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

  constructor() { }

  ngOnInit(): void {
  this.listaDeTemas = Object.values(Tema).map(valorEnum => {
        
        const titulo = TemaDescricoes[valorEnum];
        const rotaFormatada = valorEnum.toLowerCase();

        return {
          titulo: titulo,
          qtdFlashcards: 0,
          rota: `/usuario/flashcards/${rotaFormatada}`
        };
      });
    }

}