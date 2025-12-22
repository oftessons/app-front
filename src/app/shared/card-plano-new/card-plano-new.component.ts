import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card-plano-new',
  templateUrl: './card-plano-new.component.html',
  styleUrls: ['./card-plano-new.component.css']
})
export class CardPlanoNewComponent {
  
  // Badge branca superior esquerda (Ex: "24h Grátis" ou "Mais vendido")
  @Input() badgeText: string = '';

  // Título Principal (Ex: "Gratuito" OU "12x R$175,51")
  @Input() mainTitle: string = '';

  // Sufixo pequeno ao lado do título (Ex: "/mês")
  @Input() titleSuffix: string = '';

  // Subtítulo pequeno abaixo do título (Ex: "ou R$ 1.697,00 à vista")
  @Input() subTitle: string = '';

  // Lista de benefícios
  @Input() features: string[] = [];

  // Texto do botão
  @Input() buttonText: string = 'Escolher Plano';

  // Evento de clique
  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick() {
    this.buttonClick.emit();
  }
}