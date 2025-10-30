import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-flashcards-subtemas',
  templateUrl: './flashcards-subtemas.component.html',
  styleUrls: ['./flashcards-subtemas.component.css']
})
export class FlashcardsSubtemasComponent implements OnInit {
  @Input() subtema: string = 'Subtema';
  @Input() porcentagem: number = 0;
  @Input() cards_estudados: number = 0;
  @Input() cards_total: number = 0;
 
  constructor() { }

  ngOnInit(): void {
  }

}
