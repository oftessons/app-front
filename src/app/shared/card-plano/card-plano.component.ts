import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

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
  @Input() mostrarPorMes: boolean = true;
  @Input() textoParcelas: string = '';

  @Output() botaoClicado = new EventEmitter<void>();
  @Input() rota!: string;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  acao(): void {
    this.botaoClicado.emit();
  }

  navegarParaPlano() {
    if (this.rota) {
      this.router.navigate([this.rota]);
    }
  }

}
