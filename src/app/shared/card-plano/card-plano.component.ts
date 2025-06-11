import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { StripeService } from 'src/app/services/stripe.service';
import { HotmartService } from 'src/app/services/hotmart.service';
import { PlanosComponent } from 'src/app/planos/planos/planos.component';
import { Plano } from 'src/app/planos/enums/planos';
import { AuthService } from 'src/app/services/auth.service';

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
    private hotmartService: HotmartService,
    private authService: AuthService
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

    if (this.planoSelecionado === Plano.GRATUITO) {
      
      const usuario = this.authService.getUsuarioAutenticado();
      if (!usuario || !usuario.planoId) {
        console.error('Usuário não autenticado ou plano não definido.');
        return;
      }
      this.authService.iniciarPeriodoTeste(usuario).subscribe(
        response => {
          const usuario = this.authService.getUsuarioAutenticado();
          if (usuario) {
            usuario.dataFimTeste = response.dataFimTeste;
            localStorage.setItem('usuario', JSON.stringify(usuario));
            localStorage.setItem('testeIniciado', 'true');
            
            this.router.navigate(['/usuario/dashboard']);
          }
        },
        error => console.error('Erro ao iniciar período de teste:', error)
      );
    }
  }
}
