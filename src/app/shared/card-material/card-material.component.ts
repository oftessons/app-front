import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card-material',
  templateUrl: './card-material.component.html',
  styleUrls: ['./card-material.component.css']
})
export class CardMaterialComponent {
  @Input() imageSrc: string = '';
  @Input() imageAlt: string = 'Capa do material';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() buttonText: string = 'BAIXE GRÁTIS';

  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick() {
    this.buttonClick.emit();
  }
}