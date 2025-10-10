import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

type FlashcardsState = 'question' | 'answer' | 'summary'

@Component({
  selector: 'app-flashcard-modal',
  templateUrl: './flashcard-modal.component.html',
  styleUrls: ['./flashcard-modal.component.css']
})
export class FlashcardModalComponent implements OnInit, OnChanges {

  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();

  estado_atual: FlashcardsState = 'question';

  question = 'Qual estrutura é responsável pela drenagem do humor aquoso?';
  answer = 'Canal de Schlemm';
  answerDescription =  "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";


  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']) {
      
      if (!changes['isVisible'].currentValue) {

        this.estado_atual = 'question';
      }
    }
  }

  onCloseClick(): void {
    this.close.emit();
  }

  showAnswer(): void {
    this.estado_atual = 'answer';
  }

  //Quando o back ficar pronto, devo mudar essa função para receber a nota
  rateAnswer(rating: number): void {
    this.estado_atual = 'summary';
  }

}
