import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Router } from '@angular/router';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { OfensivaDados, OfensivaService } from 'src/app/services/ofensiva.service';
import { PageMeuPerfilComponent } from '../page-meu-perfil/page-meu-perfil.component';
import { AnimationOptions } from 'ngx-lottie';
import { ModalPadraoService } from 'src/app/services/modal-padrao.service';
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

  public animacoesAtivadas: boolean = true;
  targetAnimationOptions: AnimationOptions = {
    path: 'assets/animations/Target.json',
    loop: false,
    autoplay: true
  };

  @ViewChild('modalTrilhaContent') modalTrilhaContent!: TemplateRef<any>;
  @ViewChild('modalConfirmacaoContent') modalConfirmacaoContent!: TemplateRef<any>;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private ofensivaService: OfensivaService,
    private Router: Router,
    private modalPadraoService: ModalPadraoService
  ) { }

  ngOnInit(): void {
    this.authService.verificarPermissao().subscribe(
      response => this.possuiPermissao = response.accessGranted,
      err => console.error('Erro ao buscar a permissão ', err)
    );
    this.animacoesAtivadas = PageMeuPerfilComponent.getAnimacoesStatus();
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
    // this.modalPadraoService.openModal(
    //   {
    //     title: 'Configurar minha programação de revisões',
    //     size: 'lg',
    //     showConfirmButton: true,
    //     showCancelButton: true,
    //     confirmButtonText: 'Salvar',
    //     cancelButtonText: 'Cancelar',
    //     confirmButtonClass: 'primary',
    //     contentTemplate: this.modalTrilhaContent
    //   },
    //   () => this.salvarConfiguracoesTrilha(),
    //   () => this.fecharModalConfiguracaoTrilha()
    // );
  }

  fecharModalConfiguracaoTrilha(): void {
    this.modalPadraoService.closeModal();
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
    // console.log('Assuntos disponíveis:', this.assuntosDisponiveis);
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
    
    // Abre o modal de confirmação (segundo passo)
    this.abrirModalConfirmacao();
  }

  abrirModalConfirmacao(): void {
    this.modalPadraoService.openModal(
      {
        size: 'md',
        showConfirmButton: false,
        showCancelButton: false,
        showCloseButton: false,
        closeOnBackdropClick: false,
        contentTemplate: this.modalConfirmacaoContent
      }
    );
  }

  fecharModalConfirmacao(): void {
    this.modalPadraoService.closeModal();
  }

  iniciarTrilhaAgora(): void {
    this.modalPadraoService.closeModal();
    this.Router.navigate(['/usuario/trilha']);
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
      // console.log('Usuário precisa completar o cadastro.');
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
      localStorage.setItem('cadastro_completo', isCompleto.cadastroCompleto.toString());

      if (!isCompleto.cadastroCompleto) {
        this.mostrarAvisoCadastro = true;
        return;
      }

      this.mostrarAvisoCadastro = false;

    });
  }
}
