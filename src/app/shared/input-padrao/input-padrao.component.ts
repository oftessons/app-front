import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-input-padrao',
  templateUrl: './input-padrao.component.html',
  styleUrls: ['./input-padrao.component.css']
})
export class InputPadraoComponent implements OnInit {

  @Input() label: string = '';
  @Input() value: string = '';
  @Input() placeholder: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  onFocus(): void {
  }

  onBlur(): void {
  }

}
