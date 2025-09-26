import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Router } from '@angular/router';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
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

  modalTrilhaAberto: boolean = false;
  modalConfirmacaoAberto: boolean = false;
  diasSelecionados: string[] = [];
  horasDedicadas: number = 0;
  minutosDedicados: number = 0;
  dataTermino: string = '';
  assuntosSelecionados: string[] = [];
  assuntosDisponiveis: string[] = [];
  
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
    this.carregarAssuntos();
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
    // this.modalTrilhaAberto = true;
  }

  fecharModalConfiguracaoTrilha(): void {
    this.modalTrilhaAberto = false;
  }

  fecharModalConfirmacao(): void {
    this.modalConfirmacaoAberto = false;
  }

  toggleDiaSelecionado(dia: string): void {
    const index = this.diasSelecionados.indexOf(dia);
    if (index > -1) {
      this.diasSelecionados.splice(index, 1);
    } else {
      this.diasSelecionados.push(dia);
    }
  }

  verificarDiaSelecionado(dia: string): boolean {
    return this.diasSelecionados.includes(dia);
  }

  carregarAssuntos() {
    this.assuntosDisponiveis = Object.values(TemaDescricoes);
    console.log('Assuntos disponíveis:', this.assuntosDisponiveis);
  }

  onAssuntosSelecionados(event: any): void {
    const selectedOptions = Array.from(event.target.selectedOptions);
    this.assuntosSelecionados = selectedOptions.map((option: any) => option.value);
    console.log('Assuntos selecionados:', this.assuntosSelecionados);
  }

  salvarConfiguracoesTrilha(): void {
    // if(this.diasSelecionados.length === 0) {

    //   return;
    // }

    // if(this.horasDedicadas === 0 && this.minutosDedicados === 0) {

    //   return;
    // }

    // if(this.assuntosSelecionados.length === 0) {

    //   return;
    // }

    // if(!this.dataTermino) {

    //   return;
    // }

    console.log('Configurações salvas:');
    console.log('Dias selecionados:', this.diasSelecionados);
    console.log('Tempo dedicado:', this.horasDedicadas, 'horas e', this.minutosDedicados, 'minutos');
    console.log('Data de término:', this.dataTermino);
    console.log('Assuntos selecionados:', this.assuntosSelecionados);
    this.modalTrilhaAberto = false;
    this.modalConfirmacaoAberto = true;
  }

  iniciarTrilhaAgora(): void {
    this.modalConfirmacaoAberto = false;
    this.Router.navigate(['/usuario/trilha']);
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
