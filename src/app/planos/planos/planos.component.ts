import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { StripeService } from 'src/app/services/stripe.service';

@Component({
  selector: 'app-planos',
  templateUrl: './planos.component.html',
  styleUrls: ['./planos.component.css']
})
export class PlanosComponent implements OnInit {
  mostrarPlanoGratuito: boolean = false;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private stripeService: StripeService
  ) {}
  
  ngOnInit(): void {
    this.verificarStatusPlanoGratuito();
  }  

  verificarStatusPlanoGratuito(): void {
    if (this.authService.isAuthenticated()) {
      this.stripeService.getPlanInformation().subscribe(
        plano => {
          if(plano.data.status === 'active' || plano.data.status === 'trialing' || plano.data.status === 'expired') {
            this.mostrarPlanoGratuito = false;
          } else {
            this.mostrarPlanoGratuito = true;
          }
        },
        error => {
          console.error('Erro ao verificar o status do plano gratuito: ', error);
          this.mostrarPlanoGratuito = true; 
        }
      );
    }
  }

  onBotaoClicado(): void {
    console.log('Botão do card clicado!');
  }

}