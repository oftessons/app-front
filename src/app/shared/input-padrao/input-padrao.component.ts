import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-padrao',
  templateUrl: './input-padrao.component.html',
  styleUrls: ['./input-padrao.component.css']
})
export class InputPadraoComponent implements OnInit {

  @Input() label: string = '';
  @Input() value: string = '';
  @Input() placeholder: string = '';
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  onFocus(): void {
  }

  onBlur(): void {
  }

  onValueChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.value = inputElement.value;
    this.valueChange.emit(this.value);
  }

}
