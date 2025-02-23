import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card-plano',
  templateUrl: './card-plano.component.html',
  styleUrls: ['./card-plano.component.css']
})
export class CardPlanoComponent {
  @Input() titulo: string = '';
  @Input() descricao: string[] = [];
  @Input() preco: number = 0;
  @Input() textoBotao: string = 'Escolher plano';
  @Input() recomendado: boolean = false;
  @Input() corCabecalho: string = '';
  @Input() textoAdicional: string = '';

  @Output() botaoClicado = new EventEmitter<void>();
  @Input() rota: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  acao(): void {
    this.botaoClicado.emit();
  }

}
