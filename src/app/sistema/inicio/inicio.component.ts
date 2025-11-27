import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Router } from '@angular/router';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { OfensivaDados, OfensivaService } from 'src/app/services/ofensiva.service';
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
  mostrarAvisoCadastro: boolean = false;

  opcoesFiltro: string[] = ['Diário', 'Semanal', 'Mensal', 'Anual'];
  filtroSelecionado: string = 'Semanal';

  dadosOfensiva: OfensivaDados | null = null;
  isLoadingOfensiva = true;
  mostrarModalOfensiva = false;

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
    private ofensivaService: OfensivaService,
    private Router: Router
  ) { }

  ngOnInit(): void {
    this.authService.verificarPermissao().subscribe(
      response => this.possuiPermissao = response.accessGranted,
      err => console.error('Erro ao buscar a permissão ', err)
    );
    this.obterNomeUsuario();
    this.carregarDadosOfensiva();
    this.carregarAssuntos();
    this.verificarCadastroIncompleto();
    this.verificarCompletarCadastro();
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

  carregarDadosOfensiva(): void {
    this.isLoadingOfensiva = true;
    this.ofensivaService.getDadosOfensiva().subscribe({
      next: (dados) => {
        console.log(dados);
        this.dadosOfensiva = dados;
        this.isLoadingOfensiva = false;

        if (dados.ofensivaAtualizadaHoje) {
          this.mostrarModalOfensiva = true;
        }
      },
      error: (err) => {
        console.error("Erro ao carregar dados da ofensiva:", err);
        this.isLoadingOfensiva = false;
      }
    });
  }

  // --- Métodos do Modal de Ofensiva ---
  fecharModalOfensiva(): void {
    this.mostrarModalOfensiva = false;
  }

  iniciarTrilhaAgora(): void {
    this.modalConfirmacaoAberto = false;
    this.Router.navigate(['/usuario/trilha']);
  }

  redirecionarFlashcard() {
    // this.Router.navigate(['/usuario/flashcards']);
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

  verificarCadastroIncompleto(): void {
    //onst precisaCompletar = localStorage.getItem('precisa_completar_cadastro');
    const cadastroCompleto = localStorage.getItem('cadastro_completo');

    if (cadastroCompleto !== 'true') {
      this.mostrarAvisoCadastro = true;
      console.log('Usuário precisa completar o cadastro.');
    }
  }

  irParaPerfil(): void {
    this.Router.navigate(['/usuario/minha-conta']);
  }

  fecharAvisoCadastro(): void {
    this.mostrarAvisoCadastro = false;
  }

  private verificarCompletarCadastro(): void {
    // const cadastroCompleto = localStorage.getItem('cadastro_completo');
    // if (cadastroCompleto === 'true') {
    //   return;
    // }
    this.authService.verificarCadastroCompleto().subscribe(isCompleto => {
      if (isCompleto) {
        localStorage.setItem('cadastro_completo', isCompleto.cadastroCompleto.toString());
        return;
      }
      localStorage.setItem('precisa_completar_cadastro', 'true');
    });
  }
}
