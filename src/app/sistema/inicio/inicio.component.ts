import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  nomeUsuario: string = '';
  mostrarMensagemAulas: boolean = false;
  mostrarMensagemFlashcard: boolean = false;
  linkFlashcard: string = 'www.google.com';
  possuiPermissao: boolean = true;

  opcoesFiltro: string[] = ['Diário', 'Semanal', 'Mensal', 'Anual'];
  filtroSelecionado: string = 'Semanal';

  respostasCertas: number = 0;
  respostasErradas: number = 0;
  aulasAssistidas: number = 0;
  flashcardsEstudados: number = 0;
  
  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private Router: Router
  ) { }

  ngOnInit(): void {
    this.authService.verificarPermissao().subscribe(
      response => this.possuiPermissao = response.accessGranted,
      err => console.error('Erro ao buscar a permissão ', err)
    );
    this.obterNomeUsuario();
  }

  obterNomeUsuario(): void {
    this.authService.obterNomeUsuario().subscribe(
      nome => this.nomeUsuario = nome,
      err => console.error('Erro ao buscar nome do usuário', err)
    );
  }

  onFiltroSelecionado(event: any): void {
    const filtroSelecionado = event.target.value;
    console.log('Filtro selecionado:', filtroSelecionado);
  }

  abrirModalConfiguracaoTrilha(): void {
    this.Router.navigate(['/usuario/trilha']); //! remover para implementar modal
  }

  redirecionarFlashcard() {
    this.Router.navigate(['/usuario/flashcards']);
  }
  
  exibirMensagem(tipo: string): void {
    if (tipo === 'aulas') {
      this.mostrarMensagemAulas = true;
      setTimeout(() => {
        this.mostrarMensagemAulas = false;
      }, 3000); // 3 segundos
    } else if (tipo === 'flashcard') {
      this.mostrarMensagemFlashcard = true;
      setTimeout(() => {
        this.mostrarMensagemFlashcard = false;
      }, 3000); //  3 segundos
    }
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
