import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  nomeUsuario: string = ''; // Variável para armazenar o nome do usuário
  possuiPermissao: boolean = true;

  mostrarContador: boolean = false;
  diasRestantes: string = '00';
  horasRestantes: string = '00';
  minutosRestantes: string = '00';
  segundosRestantes: string = '00';
  private timerSubscription?: Subscription;
  private dataFimTeste?: Date;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.obterNomeUsuario().subscribe(
      nome => this.nomeUsuario = nome,
      err => console.error('Erro ao buscar nome do usuário ', err)
    );
    
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

    this.verificarPeriodoTeste();
  }

  verificarPeriodoTeste() {
    const usuario = this.authService.getUsuarioAutenticado();
    if(usuario && !usuario.dataFimTeste && localStorage.getItem('testeIniciado')) {
      this.router.navigate(['/planos'], { 
        queryParams: { modeTeste: true }
      });
      return;
    }
    const dataFimTeste = usuario?.dataFimTeste;
    if (dataFimTeste) {
      this.dataFimTeste = new Date(dataFimTeste);
      this.mostrarContador = true;
      document.documentElement.querySelector('mat-toolbar')?.classList.add('espacamento-toolbar');
      document.documentElement.querySelector('mat-drawer-container')?.classList.add('espacamento-toolbar');
      this.iniciarContador();
    } else {
      this.mostrarContador = false;
      this.timerSubscription?.unsubscribe();
    }
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
}
