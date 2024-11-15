import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Permissao } from 'src/app/login/Permissao';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  usuarioLogado: Usuario | null = null;
  nomeUsuario: string = '';
  diasRestantes: number = 60;
  horasRestantes: number = 0;
  minutosRestantes: number = 0;
  segundosRestantes: number = 0; 
  private intervalId: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.obterNomeUsuario().subscribe(
      nome => this.nomeUsuario = nome,
      err => console.error('Erro ao buscar nome do usuário', err)
    );
    this.usuarioLogado = this.authService.getUsuarioAutenticado();
    console.log(this.usuarioLogado); // Verifica se o usuário está sendo carregado corretamente
    this.iniciarContador();
  }

  isAdmin(): boolean {
    return this.usuarioLogado?.permissao === 'ROLE_ADMIN'; // Verifica se o usuário é admin
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  iniciarContador() {
    let fim = new Date(localStorage.getItem('dataFinal') || '');
    if (!fim || fim.toString() === 'Invalid Date') {
      fim = new Date();
      fim.setDate(fim.getDate() + this.diasRestantes);
      localStorage.setItem('dataFinal', fim.toISOString());
    }

    this.intervalId = setInterval(() => {
      const agora = new Date().getTime();
      const distancia = fim.getTime() - agora;

      this.diasRestantes = Math.floor(distancia / (1000 * 60 * 60 * 24));
      this.horasRestantes = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutosRestantes = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
      this.segundosRestantes = Math.floor((distancia % (1000 * 60)) / 1000);

      if (distancia < 0) {
        clearInterval(this.intervalId);
        this.diasRestantes = 0;
        this.horasRestantes = 0;
        this.minutosRestantes = 0;
        this.segundosRestantes = 0;
      }
    }, 1000);
  }

  irParaPesquisa() {
    this.router.navigate(['/pesquisa']);
  }
  
}