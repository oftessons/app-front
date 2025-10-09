import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-flashcard-modal',
  templateUrl: './flashcard-modal.component.html',
  styleUrls: ['./flashcard-modal.component.css']
})
export class FlashcardModalComponent implements OnInit {

  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();


  constructor() { }

  ngOnInit(): void {
  }

  onCloseClick(): void {
    this.close.emit();
  }

}
