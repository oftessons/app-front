import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';

declare var bootstrap: any;


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  usuarioLogado: Usuario | null = null;
  nomeUsuario: string = '';
  diasRestantes: number = 60;
  horasRestantes: string = '00';
  minutosRestantes: string = '00';
  segundosRestantes: string = '00';
  possuiPermissao: boolean = true;

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
    this.iniciarContador();

    this.authService.verificarPermissao().subscribe(
      response => this.possuiPermissao = response.accessGranted,
      err => console.error('Erro ao buscar a permissão ', err)
    );

  }

  isAdmin(): boolean {
    return this.usuarioLogado?.permissao === 'ROLE_ADMIN'; 
  }

  isProf(): boolean {
    return this.usuarioLogado?.permissao === 'ROLE_PROFESSOR'; 
  }

  openModal() {
    const modalElement = document.getElementById('tutorialModal');
    if (modalElement) {
      const myModal = new bootstrap.Modal(modalElement);
      myModal.show();
    }
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
      this.horasRestantes = this.formatTime(Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      this.minutosRestantes = this.formatTime(Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60)));
      this.segundosRestantes = this.formatTime(Math.floor((distancia % (1000 * 60)) / 1000));

      if (distancia < 0) {
        clearInterval(this.intervalId);
        this.diasRestantes = 0;
        this.horasRestantes = '00';
        this.minutosRestantes = '00';
        this.segundosRestantes = '00';
      }
    }, 1000);
  }

  formatTime(time: number): string {
    return time < 10 ? `0${time}` : `${time}`;
  }

  
}