import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  nomeUsuario: string = ''; // Variável para armazenar o nome do usuário
  possuiPermissao: boolean = true;

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
