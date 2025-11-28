import { Component, Input, Output, EventEmitter } from '@angular/core'; // Adicione Output e EventEmitter

@Component({
  selector: 'app-flashcards-temas-cards',
  templateUrl: './flashcards-temas-cards.component.html',
  styleUrls: ['./flashcards-temas-cards.component.css']
})
export class FlashcardsTemasCardsComponent {
  @Input() tema: string = 'Tema';
  @Input() numeroFlashcards: number = 0;
  @Input() caminho?: string | null;

  @Output() acaoEstudar = new EventEmitter<void>(); 

  constructor() { }
}