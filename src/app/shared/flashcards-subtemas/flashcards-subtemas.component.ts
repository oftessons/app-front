import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-flashcards-subtemas',
  templateUrl: './flashcards-subtemas.component.html',
  styleUrls: ['./flashcards-subtemas.component.css']
})
export class FlashcardsSubtemasComponent implements OnInit {
  @Input() subtema: string = 'Subtema';
  @Input() porcentagem: number = 0;
  @Input() cards_estudados: number = 0;
  @Input() cards_total: number = 12;
 
  @Output() study = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  onStudyClick(): void {
    this.study.emit();
  }
}