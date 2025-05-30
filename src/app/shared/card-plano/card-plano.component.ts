import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { StripeService } from 'src/app/services/stripe.service';
import { HotmartService } from 'src/app/services/hotmart.service';
import { PlanosComponent } from 'src/app/planos/planos/planos.component';
import { Plano } from 'src/app/planos/enums/planos';

@Component({
  selector: 'app-card-plano',
  templateUrl: './card-plano.component.html',
  styleUrls: ['./card-plano.component.css']
})
export class CardPlanoComponent implements OnInit {
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
  @Input() usarServicoPagamento: boolean = false;
  @Input() planoSelecionado: string = '';
  @Input() planoHotmart: string = '';

  constructor(
    private router: Router,
    private stripeService: StripeService,
    private hotmartService: HotmartService
  ) { }

  ngOnInit(): void { }

  acao(): void {
    this.botaoClicado.emit();
  }

  navegarParaPlano(): void {
    const planosPermitidos: String[] = [
      Plano.FLASHCARDS,
      Plano.SEMESTRAL_PARCELADO,
      Plano.ANUAL_PARCELADO,
      Plano.COMBO
    ]

    // hotmart
    if (planosPermitidos.includes(this.planoSelecionado)) {
      this.hotmartService.obterLinkCompraFlashcard(this.planoHotmart).subscribe(
        (response: any) => {
          window.location.href = response.url_checkout;
        },
        (error) => {
          console.error('Erro ao obter link da Hotmart:', error.message);
          alert('Você precisa estar logado para acessar essa página.');
        }
      );
      return;
    }


    // stripe
    if (this.usarServicoPagamento) {
      this.stripeService.createCheckoutSession(this.planoSelecionado).subscribe(
        (response: any) => {
          window.location.href = response.url_checkout;
        },
        (error) => {
          console.error('Erro ao gerar link de pagamento:', error);
        }
      );
    } else if (this.rota.includes('#')) {
      window.location.href = this.rota;
    } else {
      this.router.navigate([this.rota]);
    }
  }
}
