import { Component, ViewChild, NgZone } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { StripeService } from 'src/app/services/stripe.service';
import { interval, Subscription } from 'rxjs';
import { filter, delay } from 'rxjs/operators';
import { ThemeService } from 'src/app/services/theme.service';
import { Usuario } from 'src/app/login/usuario';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  nomeUsuario: string = ''; // Variável para armazenar o nome do usuário
  possuiPermissao: boolean = true;

  usuarioLogado: Usuario | null = null;
  
  mostrarContador: boolean = false;
  diasRestantes: string = '00';
  horasRestantes: string = '00';
  minutosRestantes: string = '00';
  segundosRestantes: string = '00';
  private timerSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private dataFimTeste?: Date;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router,
    private stripeService: StripeService,
    private ngZone: NgZone,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.authService.obterNomeUsuario().subscribe(
      nome => this.nomeUsuario = nome,
      err => console.error('Erro ao buscar nome do usuário ', err)
    );

    this.usuarioLogado = this.authService.getUsuarioAutenticado();
    
    // Inicializar posição baseado no estado inicial da sidebar
    setTimeout(() => {
      this.adjustNavigationPosition(this.isSidenavOpen());
    }, 100);
    
    // Observer para mudanças de tamanho da tela
    this.breakpointObserver.observe('(min-width: 901px)').subscribe(() => {
      this.adjustNavigationPosition(this.isSidenavOpen());
    });

    this.authService.verificarPermissao().subscribe(
        response => this.possuiPermissao = response.accessGranted,
        err => console.error('Erro ao buscar a permissão ', err)
    );

    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        delay(1) //esse delay esta garantindo o espacamento na tela de painel de controle 
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          this.aplicarEspacamentoToolbar();
        });
      });
    
    if(this.authService.isAuthenticated()) {
      this.verificarPeriodoTeste();
    }
  }

  verificarPeriodoTeste() {
    if (localStorage.getItem('dataFimTeste') && this.authService.getUsuarioAutenticado()?.diasDeTeste) {
      const dataFimTeste = localStorage.getItem('dataFimTeste');
      if (dataFimTeste) {
        this.dataFimTeste = new Date(dataFimTeste);
        if (this.dataFimTeste > new Date()) {
          this.mostrarContador = true;
          this.aplicarEspacamentoToolbar();
          this.iniciarContador();
        } else {
          this.mostrarContador = false;
          this.timerSubscription?.unsubscribe();
          localStorage.removeItem('dataFimTeste');
          this.removerEspacamentoToolbar();
        }
      }
    } else {
      this.stripeService.getPlanInformation().subscribe(
        (response) => {
          //console.log('Informações do plano:', response);
          const dataFimTeste = response.data.validoAte;
          if (new Date(dataFimTeste) > new Date()) {
            this.dataFimTeste = new Date(dataFimTeste);
            this.mostrarContador = true;
            localStorage.setItem('dataFimTeste', dataFimTeste);
            this.aplicarEspacamentoToolbar();
            this.iniciarContador();
          } else {
            this.mostrarContador = false;
            this.timerSubscription?.unsubscribe();
            localStorage.removeItem('dataFimTeste');
            this.removerEspacamentoToolbar();
          }
        },
        (error) => {
          console.error('Erro ao obter informações do plano:', error);
        }
      );
    }
  }

  aplicarEspacamentoToolbar() {
    if (this.mostrarContador) {
      document.documentElement.querySelector('mat-toolbar')?.classList.add('espacamento-toolbar');
      document.documentElement.querySelector('mat-drawer-container')?.classList.add('espacamento-toolbar');
    }
  }

  removerEspacamentoToolbar() {
    document.documentElement.querySelector('mat-toolbar')?.classList.remove('espacamento-toolbar');
    document.documentElement.querySelector('mat-drawer-container')?.classList.remove('espacamento-toolbar');
  }

  iniciarContador() {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (!this.dataFimTeste) return;
      
      const agora = new Date();
      const diff = this.dataFimTeste.getTime() - agora.getTime();
      
      if (diff <= 0) {
        // Período expirado
        this.mostrarContador = false;
        this.timerSubscription?.unsubscribe();
        return;
      }
      
      // Calcular dias, horas, minutos e segundos restantes
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Formatar com dois dígitos
      this.diasRestantes = dias.toString().padStart(2, '0');
      this.horasRestantes = horas.toString().padStart(2, '0');
      this.minutosRestantes = minutos.toString().padStart(2, '0');
      this.segundosRestantes = segundos.toString().padStart(2, '0');
    });
  }

  navegarParaPlanos() {
    this.router.navigate(['/planos']);
  }

  logout() {
    this.authService.encerrarSessao();
    this.router.navigate(['/login']);
  }

  toggleSidenav() {
    this.sidenav.toggle();
    
    // Esperar a operação de toggle completar
    setTimeout(() => {
      const isOpen = this.sidenav.opened;
      this.adjustNavigationPosition(isOpen);
      console.log('Sidenav is now', isOpen ? 'open' : 'closed');
    }, 50);
  }
  
  adjustNavigationPosition(isOpen: boolean) {
    if (this.breakpointObserver.isMatched('(min-width: 901px)')) {
      const navigationElement = document.querySelector('.navigation-fixed') as HTMLElement;
      if (navigationElement) {
        navigationElement.style.left = isOpen ? '200px' : '0';
        navigationElement.style.transition = 'left 0.3s ease';
      }
    }
  }
  

  isSidenavOpen() {
    return this.breakpointObserver.isMatched('(min-width: 901px)');
  }

  getSidenavMode() {
    return this.breakpointObserver.isMatched('(min-width: 901px)') ? 'side' : 'over';
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  isProf(): boolean {
    return this.usuarioLogado?.permissao === 'ROLE_PROFESSOR'; 
  }

  permissionAllowed(): boolean {
    return this.usuarioLogado?.permissao === 'ROLE_PROFESSOR' || this.usuarioLogado?.permissao === 'ROLE_ADMIN';
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
