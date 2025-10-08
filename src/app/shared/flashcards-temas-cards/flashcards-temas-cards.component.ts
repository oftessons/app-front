import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-flashcards-temas-cards',
  templateUrl: './flashcards-temas-cards.component.html',
  styleUrls: ['./flashcards-temas-cards.component.css']
})
export class FlashcardsTemasCardsComponent {
  @Input() tema: string = 'Tema';
  @Input() numeroFlashcards: number = 0;
  @Input() caminho: string = '#';
 
  constructor() { }

  ngOnInit(): void {
  }

}
