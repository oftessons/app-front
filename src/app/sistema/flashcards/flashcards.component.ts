import { Component, OnInit } from '@angular/core';

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
    this.listaDeTemas = [
      { titulo: 'Catarata', qtdFlashcards: 52, rota: '/usuario/flashcards/catarata' },
      { titulo: 'Glaucoma', qtdFlashcards: 78, rota: '/usuario/flashcards/glaucoma' },
      { titulo: 'Retina', qtdFlashcards: 112, rota: '/usuario/flashcards/retina' },
      { titulo: 'Córnea', qtdFlashcards: 89, rota: '/usuario/flashcards/cornea' }
    ];
  }
}