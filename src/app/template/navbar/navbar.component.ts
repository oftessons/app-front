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

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Chama o serviço para buscar o nome do usuário autenticado
    this.authService.obterNomeUsuario().subscribe(
      nome => this.nomeUsuario = nome, // Armazena o nome do usuário
      err => console.error('Erro ao buscar nome do usuário', err)
    );
  }

  logout() {
    this.authService.encerrarSessao();
    this.router.navigate(['/login']);
  }

  toggleSidenav() {
    this.sidenav.toggle();
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
