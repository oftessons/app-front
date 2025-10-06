import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, PipeTransform, Optional, Injectable, Inject } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { TipoDeProva } from './enums/tipoDeProva';
import {
  getDescricaoAno,
  getDescricaoCertoErrado,
  getDescricaoDificuldade,
  getDescricaoQuestaoComentadas,
  getDescricaoRespostasSimulado,
  getDescricaoSubtema,
  getDescricaoTema,
  getDescricaoTipoDeProva,
} from './enums/enum-utils';
import { Ano } from './enums/ano';
import { Dificuldade } from './enums/dificuldade';
import { Subtema } from './enums/subtema';
import { Tema } from './enums/tema';
import { Questao } from './questao';
import { temasESubtemas } from './enums/map-tema-subtema';
import { RespostasSimulado } from './enums/resp-simu';
import { QuestoesService } from 'src/app/services/questoes.service';
import { FiltroService } from 'src/app/services/filtro.service';
import { RespostaDTO } from '../RespostaDTO'; // Adicione esta importação
import { Resposta } from '../Resposta'; // Adicione esta importação
import { AuthService } from 'src/app/services/auth.service';
import { QuestoesStateService } from 'src/app/services/questao-state.service';
import { ThemeService } from 'src/app/services/theme.service';
import { StripeService } from 'src/app/services/stripe.service';
import { Usuario } from 'src/app/login/usuario';
import { FiltroDTO } from '../filtroDTO';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { AnoDescricoes } from './enums/ano-descricoes';
import { DificuldadeDescricoes } from './enums/dificuldade-descricao';
import { TipoDeProvaDescricoes } from './enums/tipodeprova-descricao';
import { SubtemaDescricoes } from './enums/subtema-descricao';
import { TemaDescricoes } from './enums/tema-descricao';
import { CertasErradas } from './enums/certas-erradas';
import { CertasErradasDescricao } from './enums/certas-erradas-descricao';
import { RespostasSimuladosDescricao } from './enums/resp-simu-descricao';
import { filter, switchMap } from 'rxjs/operators';
import { NavigateService } from 'src/app/services/navigate.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Comentada } from './enums/comentadas';
import { ComentadasDescricao } from './enums/comentadas-descricao';
import { RespostasFiltroSessaoDTO } from './RespostasFiltroSessaoDTO';
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


declare var bootstrap: any;

interface DadosCuriosidade {
  qtdQuestoes: number;
  totalQuestoes: number;
  porcentagem: number;
}

interface CuriosidadeResponse {
  mensagem: string;
  subtema: string;
  tipoDeProva: string;
  anos: string[];
  dadosCuriosidade: DadosCuriosidade[];
}

@Component({
  selector: 'app-page-questoes',
  templateUrl: './page-questoes.component.html',
  styleUrls: ['./page-questoes.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px) scale(0.95)' }),
        animate('600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }))
      ])
    ])
  ]
})
export class PageQuestoesComponent implements OnInit, AfterViewChecked {
  carregando: boolean = false;
  carregandoSalvar: boolean = false;
  revisandoFiltroSalvo: boolean = false;
  carregandoEstadoInicial: boolean = true;
  filtroSelecionado: any;
  filtrosBloqueados: boolean = false;
  questao: Questao = new Questao();
  selectedOption: string = '';
  usuario!: Usuario;
  usuarioLogado: Usuario | null = null;
  usuarioId!: number;
  isTrialUser: boolean = false;
  mensagemErro: string | null = null;

  tiposDeProva = Object.values(TipoDeProva);
  anos = Object.values(Ano);
  anosPermitidosParaTrial: Ano[] = [Ano.ANO_2023, Ano.ANO_2024, Ano.ANO_2025];
  tipoDeProvasPermitidosParaTrial: TipoDeProva[] = [TipoDeProva.AAO];
  dificuldades = Object.values(Dificuldade);
  subtemas = Object.values(Subtema);
  temas = Object.values(Tema);
  respSimulado = Object.values(RespostasSimulado);
  certoErrado = Object.values(CertasErradas);
  comentadas = Object.values(Comentada);
  mensagemSucesso: string = '';
  filtroIdRespondendo: number = 0;
  anosComPremium: any[] = [];
  tiposDeProvaComPremium: any[] = [];

  jaRespondeu: boolean = false;
  respondendo: boolean = false;

  fotoPreviews: { [key: string]: string } = {};


  respostaVerificada: boolean = false;
  respostaFoiSubmetida: boolean = false;
  respostaCorreta: string | null = null;
  respostaErrada: string | null = null;
  isRespostaCorreta: boolean = false;
  message: string = '';
  resposta: string = '';

  respondidasAgora: Set<number> = new Set();

  respostasSessao: RespostasFiltroSessaoDTO | null = {
    questoesIds: [],
    idUsuario: 0,
    respostas: []
  };

  questaoAtual: Questao | null = null;
  paginaAtual: number = 0;
  filtros: any = {
    ano: null,
    dificuldade: null,
    tipoDeProva: null,
    subtema: null,
    assunto: null,
    certoErrado: null,
    respSimulado: null,
    comentadas: null,
    palavraChave: null,
  };

  mostrarCardConfirmacao = false;
  filtroASalvar!: FiltroDTO;

  mostrarGabarito: boolean = false;
  @ViewChild('confirmacaoModalRef', { static: false })
  confirmacaoModal!: ElementRef;

  questoes: Questao[] = [];
  idQuestoes: number[] = [];
  isFiltered = false;
  p: number = 1;

  questaoDTO = new Questao();
  selectedAlternativeIndex: number = -3;

  tiposDeProvaDescricoes: string[] = [];
  anosDescricoes: string[] = [];
  dificuldadesDescricoes: string[] = [];
  subtemasDescricoes: string[] = [];
  temasDescricoes: string[] = [];
  respSimuladoDescricoes: string[] = [];
  questoesCertasErradas: string[] = [];
  questoesComentadas: string[] = [];

  descricaoFiltro: string = '';
  palavraChave: string = '';
  multSelectAno: Ano[] = [];
  multSelecDificuldade: Dificuldade[] = [];
  multSelectTipoDeProva: TipoDeProva[] = [];
  multSelectSubtema: Subtema[] = [];
  multSelectTema: Tema[] = [];
  multiSelectRespSimu: RespostasSimulado[] = [];
  multiSelectCertoErrado: CertasErradas[] = [];
  multiSelectTemasSubtemasSelecionados: (Subtema | string)[] = [];
  multiSelectQuestoesComentadas: Comentada[] = [];

  subtemasAgrupadosPorTema: {
    label: string;
    value: string;
    options: { label: string; value: Subtema }[];
  }[] = [];

  valoresFinaisParaSalvar: string[] = [];

  comentarioDaQuestaoSanitizado: SafeHtml = '';
  sanitizerEnunciado: SafeHtml = '';

  porcentagens: Map<string, string> | null = null;

  questaoAtualIndex = 0;
  respostaUsuario = '';
  mostrarPorcentagem = false;
  porcentagemAcertos = 0;
  acertos = 0;

  mostrarFiltros: boolean = false;

  numeroDeQuestoes: number = 0;
  navegacaoPorQuestao: any[] = [
    {
      questao: null,
      index: 0,
    },
  ];

  mostrarBalloon: boolean = false;
  curiosidades: any[] = [];
  curiosidadeAtual: number = 0;

  nomeAlunoMentorado: string = '';
  idAlunoMentorado: string = '';

  constructor(
    private questoesService: QuestoesService,
    private questoesStateService: QuestoesStateService,
    private filtroService: FiltroService,
    private authService: AuthService,
    private themeService: ThemeService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private navigateService: NavigateService,
    private stripeService: StripeService,
    @Optional() public dialogRef: MatDialogRef<PageQuestoesComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { alunoId: string, nomeAluno: string } | null
  ) {

    this.idAlunoMentorado = data?.alunoId || '';
    this.nomeAlunoMentorado = data?.nomeAluno || '';

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      if (!e.urlAfterRedirects.includes('/questoes') &&
        !e.urlAfterRedirects.includes('/cadastro-questao/')) {
        this.questoesService.clearRequestsCache();
      }
    });
  }

  ngOnInit(): void {
    this.carregandoEstadoInicial = true;

    this.usuarioLogado = this.authService.getUsuarioAutenticado();
    this.verificarStatusUsuario();
    this.inicializarDescricoes();

    const navigationState = history.state;
    const filtroStateJson = localStorage.getItem('questoesFiltroState');

    if (navigationState && navigationState.filtroId && navigationState.revisandoFiltro) {
      this.revisandoFiltroSalvo = true;
      this.mostrarFiltros = false;
      this.carregarFiltroSalvo(navigationState.filtroId);

    } else if (filtroStateJson) {
      this.restaurarEstadoDoLocalStorage(filtroStateJson);

    } else {
      this.revisandoFiltroSalvo = false;
      this.obterPerfilUsuario().then(() => {
        this.carregandoEstadoInicial = false;
      });
    }
  }

  private carregarFiltroSalvo(filtroId: number): void {
    this.obterPerfilUsuario().then(() => {
      this.filtroService.getFiltroById(filtroId).subscribe({
        next: (meuFiltro) => {
          if (meuFiltro) {
            this.preencherDadosDoFiltro(meuFiltro);
          } else {
            this.exibirMensagem('Filtro não encontrado.', 'erro');
          }
          this.carregandoEstadoInicial = false;
        },
        error: (err) => {
          console.error('Erro ao buscar o filtro por ID:', err);
          this.exibirMensagem('Erro ao carregar o filtro.', 'erro');
          this.carregandoEstadoInicial = false;
        }
      });
    });
  }

  private restaurarEstadoDoLocalStorage(filtroStateJson: string): void {
    const filtroState = JSON.parse(filtroStateJson);
    localStorage.removeItem('questoesFiltroState');

    this.multSelectAno = filtroState.multSelectAno ?? [];
    this.multSelecDificuldade = filtroState.multSelecDificuldade ?? [];
    this.multSelectTipoDeProva = filtroState.multSelectTipoDeProva ?? [];
    this.multiSelectTemasSubtemasSelecionados = filtroState.multiSelectTemasSubtemasSelecionados ?? [];
    this.multiSelectCertoErrado = filtroState.multiSelectCertoErrado ?? [];
    this.multiSelectRespSimu = filtroState.multiSelectRespSimu ?? [];
    this.multiSelectQuestoesComentadas = filtroState.multiSelectQuestoesComentadas ?? [];
    this.palavraChave = filtroState.palavraChave ?? '';

    this.obterPerfilUsuario().then(() => {
      this.aplicarFiltrosRestaurados(filtroState.questaoId);
      this.carregandoEstadoInicial = false;
    });
  }

  private preencherDadosDoFiltro(meuFiltro: any): void {
    this.multSelectAno = meuFiltro.ano || [];
    this.multSelectTipoDeProva = meuFiltro.tipoDeProva || [];
    this.multiSelectQuestoesComentadas = meuFiltro.comentada || [];
    this.multSelecDificuldade = meuFiltro.dificuldade || [];
    this.multiSelectRespSimu = meuFiltro.respostasSimulado || [];
    this.multiSelectCertoErrado = meuFiltro.certasErradas || [];
    this.filtroIdRespondendo = meuFiltro.id || 0;

    this.multiSelectTemasSubtemasSelecionados = [];
    if (meuFiltro.tema?.length > 0) {
      meuFiltro.tema.forEach((tema: string) => {
        const temaEnum = this.obterTemaEnum(tema);
        if (temaEnum) this.multiSelectTemasSubtemasSelecionados.push(`TEMA_${temaEnum}`);
      });
    }
    if (meuFiltro.subtema?.length > 0) {
      meuFiltro.subtema.forEach((subtema: string) => {
        const subtemaEnum = this.obterSubtemaEnum(subtema);
        if (subtemaEnum) this.multiSelectTemasSubtemasSelecionados.push(subtemaEnum);
      });
    }

    if (meuFiltro.questoes && meuFiltro.questoes.length > 0) {
      this.questoes = meuFiltro.questoes;
      this.numeroDeQuestoes = this.questoes.length;
      this.paginaAtual = 0;
      this.questaoAtual = this.questoes[this.paginaAtual];
      this.navegacaoPorQuestao = this.questoes.map((q, index) => ({ questao: q, index: index }));

      if (this.usuarioId && this.questaoAtual) {
        this.buscarRespostaSalva(this.questaoAtual.id);
      }
    } else {
      this.message = "Este filtro salvo não contém questões.";
    }
  }

  private inicializarDescricoes(): void {

    this.tiposDeProvaDescricoes = this.tiposDeProva
      .filter((tipoProvaKey) => {
        if (tipoProvaKey === TipoDeProva.SBRV) {
          return this.isProf() || this.isAdmin();
        }
        return true;
      })
      .map((tipoDeProva) => this.getDescricaoTipoDeProva(tipoDeProva));

    this.anosDescricoes = this.anos.map((ano) => this.getDescricaoAno(ano));
    this.dificuldadesDescricoes = this.dificuldades.map((dificuldade) => this.getDescricaoDificuldade(dificuldade));
    this.subtemasDescricoes = this.subtemas.map((subtema) => this.getDescricaoSubtema(subtema));
    this.temasDescricoes = this.temas.map((tema) => this.getDescricaoTema(tema));
    this.respSimuladoDescricoes = this.respSimulado.map((respSimulado) => this.getDescricaoRespSimulado(respSimulado));
    this.questoesCertasErradas = this.certoErrado.map((certasErradas) => this.getDescricaoCertoErrado(certasErradas));
    this.questoesComentadas = this.comentadas.map((comentada) => this.getDescricaoQuestoesComentadas(comentada));

    this.subtemasAgrupadosPorTema = Object.entries(temasESubtemas)
      .filter(([temaKey]) => {
        if (temaKey === Tema.SBRV) {
          return this.isProf() || this.isAdmin();
        }
        return true;
      })
      .map(([temaKey, subtemas]) => {
        const temaEnum = temaKey as Tema;
        return {
          label: this.getDescricaoTema(temaEnum),
          value: `TEMA_${temaEnum}`, // Prefixo para diferenciar temas de subtemas
          options: subtemas.map(subtema => ({
            label: this.getDescricaoSubtema(subtema),
            value: subtema
          }))
        };
      });
  }

  ngAfterViewChecked(): void {
    this.resizeImages();
  }

  private verificarStatusUsuario(): void {
    if (this.usuarioLogado) {
      this.stripeService.getPlanInformation().subscribe(
        (planInfo) => {
          this.isTrialUser = planInfo.data.status === 'trialing';
          if (this.isTrialUser) {
            this.aplicarLimitacoesTrial();
            console.log('Usuário em período de teste. Aplicando limitações.');
          }
          this.prepararArraysComPremium();
        },
        (error) => {
          this.prepararArraysComPremium();
        }
      );
    } else {
      // Se não há usuário logado, preparar arrays
      this.prepararArraysComPremium();
    }
  }

  private aplicarLimitacoesTrial(): void {
    this.anosDescricoes = this.anos.map((ano) => this.getDescricaoAno(ano));
  }

  isAnoBloqueadoParaTrial(ano: string): boolean {
    if (!this.isTrialUser) return false;
    const anoEnum = this.obterAnoEnum(ano);
    return anoEnum ? !this.anosPermitidosParaTrial.includes(anoEnum) : false;
  }

  isTipoDeProvaBloqueadoParaTrial(tipoDeProva: string): boolean {
    if (!this.isTrialUser) return false;
    const tiposEspeciais = ['AAO'];
    return tiposEspeciais.includes(tipoDeProva);
  }

  temItensBloqueadosParaTrial(): boolean {
    if (this.isTrialUser) {
      const temAnosBloqueados = this.multSelectAno.some(ano => this.isAnoBloqueadoParaTrial(ano));
      if (temAnosBloqueados) return true;
    }

    const temTipoDeProvaBloqueado = this.multSelectTipoDeProva.some(tipoDeProva => this.isTipoDeProvaBloqueadoParaTrial(tipoDeProva));
    return temTipoDeProvaBloqueado;
  }

  redirecionarParaUpgrade(): void {
    this.router.navigate(['/planos']);
  }

  private prepararArraysComPremium(): void {
    // Preparar anos com informação premium
    this.anosComPremium = this.anos.map(ano => {
      const descricao = this.getDescricaoAno(ano);
      return {
        label: descricao,
        value: descricao,
        isPremium: this.isTrialUser && this.isAnoBloqueadoParaTrial(descricao),
        onPremiumClick: () => this.redirecionarParaUpgrade()
      };
    });

    // Preparar tipos de prova com informação premium
    this.tiposDeProvaComPremium = this.tiposDeProva
      .filter((tipoProvaKey) => {
        if (tipoProvaKey === TipoDeProva.SBRV) {
          return this.isProf() || this.isAdmin();
        }
        return true;
      })
      .map(tipoDeProva => {
        const descricao = this.getDescricaoTipoDeProva(tipoDeProva);
        return {
          label: descricao,
          value: descricao,
          isPremium: this.isTrialUser && descricao === 'AAO',
          onPremiumClick: () => this.redirecionarParaUpgrade()
        };
      });
  }

  isPreviewVideo(url: string | boolean): boolean {
    return typeof url === 'string' && url.endsWith('.mp4');
  }


  resizeImages(): void {
    const imgElements = document.querySelectorAll('.img-comentario img');
    imgElements.forEach((img) => {
      const imageElement = img as HTMLImageElement;
      imageElement.style.width = '300px'; // Defina o tamanho desejado
      imageElement.style.height = 'auto';
    });
  }

  applyClassesToEnunciado(content: string): SafeHtml {
    const div = document.createElement('div');
    div.innerHTML = content;

    // Verificar se há iframes de vídeo
    const iframes = div.getElementsByTagName('iframe');
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      //  console.log("Video URL:", this.questaoAtual?.videoUrl);


      // Sanitizar apenas URLs seguras (por exemplo, YouTube, Vimeo)
      const src = iframe.getAttribute('src');
      if (src && (src.startsWith('https://www.youtube.com/') || src.startsWith('https://player.vimeo.com/'))) {
        // Definir atributos padrões do iframe de vídeo
        iframe.setAttribute('width', '560'); // Largura do vídeo
        iframe.setAttribute('height', '315'); // Altura do vídeo
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'true');

      } else {
        iframe.remove();
      }
    }

    const elementsWithClasses = div.querySelectorAll('[class]');
    elementsWithClasses.forEach((element) => {
      const classList = element.className.split(' ');
      classList.forEach((className) => {
        element.classList.add(className);
      });
    });

    // Retornar o conteúdo sanitizado com vídeos
    return this.sanitizeContent(div.innerHTML);


  }

  sanitizeContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }


  onOptionChange(texto: string): void {
    this.selectedOption = texto;
    //console.log('Alternativa selecionada:', texto);
  }

  obterPerfilUsuario(): Promise<void> {
    return new Promise((resolve) => {
      this.authService.obterUsuarioAutenticadoDoBackend().subscribe({
        next: (data) => {
          this.usuario = data;
          this.usuarioId = parseInt(this.usuario.id);
          resolve();
        },
        error: () => resolve() // Resolve mesmo em caso de erro para não travar
      });
    });
  }

  onSelecaoChange(selecionados: string[]): void {
    this.valoresFinaisParaSalvar = selecionados.map(valor =>
      valor.startsWith('TEMA_') ? valor.substring(5) : valor
    );
  }

  getDescricaoTipoDeProva(tipoDeProva: TipoDeProva): string {
    return getDescricaoTipoDeProva(tipoDeProva);
  }

  getDescricoesTipoDeProva(tiposDeProva: TipoDeProva[]): string {
    return tiposDeProva.map(this.getDescricaoTipoDeProva).join('; ');
  }

  getDescricaoAno(ano: Ano): string {
    return getDescricaoAno(ano);
  }

  getDescricoesAno(anos: Ano[]): string {
    return anos.map(this.getDescricaoAno).join('; ');
  }

  getDescricaoDificuldade(dificuldade: Dificuldade): string {
    return getDescricaoDificuldade(dificuldade);
  }

  getDescricoesDificuldade(dificuldades: Dificuldade[]): string {
    return dificuldades.map(this.getDescricaoDificuldade).join('; ');
  }

  getDescricaoSubtema(subtema: Subtema): string {
    return getDescricaoSubtema(subtema);
  }

  getDescricoesSubtema(subtemas: Subtema[]): string {
    return subtemas.map(this.getDescricaoSubtema).join('; ');
  }

  getDescricaoTema(tema: Tema): string {
    return getDescricaoTema(tema);
  }

  getDescricoesTema(temas: Tema[]): string {
    return temas.map(this.getDescricaoTema).join('; ');
  }

  getDescricaoRespSimulado(respSimulado: RespostasSimulado): string {
    return getDescricaoRespostasSimulado(respSimulado);
  }

  getDescricoesRespSimulado(respSimulados: RespostasSimulado[]): string {
    return respSimulados.map(this.getDescricaoRespSimulado).join('; ');
  }

  getDescricaoCertoErrado(certoErrado: CertasErradas): string {
    return getDescricaoCertoErrado(certoErrado);
  }

  getDescricoesCertoErrado(certasErradas: CertasErradas[]): string {
    return certasErradas.map(this.getDescricaoCertoErrado).join('; ');
  }

  getDescricaoQuestoesComentadas(comentada: Comentada): string {
    return getDescricaoQuestaoComentadas(comentada);
  }

  getDescricoesQuestoesComentadas(comentada: Comentada[]): string {
    return comentada.map(this.getDescricaoQuestoesComentadas).join('; ');
  }

  obterAnoEnum(ano: string): Ano | undefined {
    const anoEnum = Object.keys(AnoDescricoes).find(
      (key) => AnoDescricoes[key as Ano] === ano
    );

    return anoEnum as Ano | undefined;
  }

  obterDificuldadeEnum(descricao: string): Dificuldade | undefined {
    const chave = Object.keys(DificuldadeDescricoes).find(
      (key) => DificuldadeDescricoes[key as Dificuldade] === descricao
    );
    return chave ? Dificuldade[chave as Dificuldade] : undefined;
  }

  obterTipoDeProvaEnum(descricao: string): TipoDeProva | undefined {
    const chave = Object.keys(TipoDeProvaDescricoes).find(
      (key) => TipoDeProvaDescricoes[key as TipoDeProva] === descricao
    );
    return chave ? TipoDeProva[chave as TipoDeProva] : undefined;
  }

  obterSubtemaEnum(descricao: string): Subtema | undefined {
    const chave = Object.keys(SubtemaDescricoes).find(
      (key) => SubtemaDescricoes[key as Subtema] === descricao
    );
    return chave ? Subtema[chave as Subtema] : undefined;
  }

  obterTemaEnum(descricao: string): Tema | undefined {
    const chave = Object.keys(TemaDescricoes).find(
      (key) => TemaDescricoes[key as Tema] === descricao
    );
    return chave ? Tema[chave as Tema] : undefined;
  }

  obterCertoErradoEnum(descricao: string): CertasErradas | undefined {
    const chave = Object.keys(CertasErradasDescricao).find(
      (key) => CertasErradasDescricao[key as CertasErradas] === descricao
    );
    return chave ? CertasErradas[chave as CertasErradas] : undefined;
  }

  obterRespSimuladoEnum(descricao: string): RespostasSimulado | undefined {
    const chave = Object.keys(RespostasSimuladosDescricao).find(
      (key) => RespostasSimuladosDescricao[key as RespostasSimulado] === descricao
    );
    return chave ? RespostasSimulado[chave as RespostasSimulado] : undefined;
  }

  obterQuestaoComentadaEnum(descricao: string): Comentada | undefined {
    const chave = Object.keys(ComentadasDescricao).find(
      (key) => ComentadasDescricao[key as Comentada] === descricao
    );
    return chave ? Comentada[chave as Comentada] : undefined;
  }


  LimparFiltro() {
    this.multSelectAno = [];
    this.multSelecDificuldade = [];
    this.multSelectTipoDeProva = [];
    this.multSelectSubtema = [];
    this.multSelectTema = [];
    this.multiSelectCertoErrado = [];
    this.multiSelectRespSimu = [];
    this.multiSelectTemasSubtemasSelecionados = [];
    this.multiSelectQuestoesComentadas = [];

    this.palavraChave = '';
    this.filtrosBloqueados = false;
    this.filtros = {
      ano: null,
      dificuldade: null,
      tipoDeProva: null,
      subtema: null,
      tema: null,
      certoErrado: null,
      respSimulado: null,
      palavraChave: null,
      comentadas: null
    };
    this.paginaAtual = 0;
  }

  private isTema(value: string): boolean {
    return Object.values(Tema).includes(value as Tema);
  }

  private isSubtema(value: string): boolean {
    return Object.values(Subtema).includes(value as Subtema);
  }


  filtrarQuestoes(): void {
    if (this.temItensBloqueadosParaTrial()) {
      this.exibirMensagem('Usuários com conta gratuita têm acesso limitado a questões de 2023 a 2025.', 'erro');
      return;
    }

    this.jaRespondeu = false;
    this.respondidasAgora.clear();
    this.carregando = true;
    this.selectedOption = '';
    this.respostaCorreta = null;
    this.respostaErrada = null;
    this.mostrarPorcentagem = false;
    this.porcentagemAcertos = 0;
    //this.fecharBalloon();


    const filtros: any = {};
    this.respondendo = true;

    if (this.multSelectAno.length) {
      const anosSelecionados = this.multSelectAno
        .map((ano) => this.obterAnoEnum(ano))
        .filter((enumAno) => enumAno !== undefined);

      if (anosSelecionados.length > 0) {
        filtros.ano = anosSelecionados;
      }
    }


    // if (this.isTrialUser && this.multSelectAno.length > 0) {
    //   const anosPermitidosDescricoes = this.anosPermitidosParaTrial.map(ano => this.getDescricaoAno(ano));
    //   const temAnoNaoPermitido = this.multSelectAno.some(ano => !anosPermitidosDescricoes.includes(ano));

    //   if (temAnoNaoPermitido) {
    //     this.exibirMensagem('Usuários com conta gratuita têm acesso limitado a questões de 2023 a 2025.', 'erro');
    //     this.carregando = false;
    //     return;
    //   }
    // }

    if (this.multSelecDificuldade.length) {
      const dificuldadeSelecionada = this.multSelecDificuldade
        .map((dificuldade) => this.obterDificuldadeEnum(dificuldade))
        .filter((enumDificuldade) => enumDificuldade !== undefined);

      if (dificuldadeSelecionada) {
        filtros.dificuldade = dificuldadeSelecionada;
      }
    }

    if (this.multSelectTipoDeProva.length) {
      const tipoDeProvaSelecionado = this.multSelectTipoDeProva
        .map((tipoDeProva) => this.obterTipoDeProvaEnum(tipoDeProva))
        .filter((enumTipoDeProva) => enumTipoDeProva !== undefined);

      if (tipoDeProvaSelecionado) {
        filtros.tipoDeProva = tipoDeProvaSelecionado;
      }
    }

    // if (this.multSelectSubtema.length) {
    //   const subtemaSelecionado = this.multSelectSubtema
    //   .map((subtema) => this.obterSubtemaEnum(subtema))
    //   .filter((enumSubtema) => enumSubtema!== undefined);

    //   if (subtemaSelecionado) {
    //     filtros.subtema = subtemaSelecionado;
    //   }
    // }

    // if (this.multSelectTema.length) {
    //   const temaSelecionado = this.multSelectTema
    //     .map((tema) => this.obterTemaEnum(tema))
    //     .filter((enumTema) => enumTema !== undefined);

    //   if (temaSelecionado) {
    //     filtros.tema = temaSelecionado;
    //   }
    // }

    if (this.multiSelectCertoErrado.length) {
      const certoErradoSelecionado = this.multiSelectCertoErrado
        .map((certoErrado) => this.obterCertoErradoEnum(certoErrado))
        .filter((enumCertoErrado) => enumCertoErrado !== undefined);

      if (certoErradoSelecionado) {
        filtros.certoErrado = certoErradoSelecionado;
      }
    }

    if (this.multiSelectRespSimu.length) {
      const respSimuladoSelecionado = this.multiSelectRespSimu
        .map((respSimu) => this.obterRespSimuladoEnum(respSimu))
        .filter((enumRespSimu) => enumRespSimu !== undefined);

      if (respSimuladoSelecionado) {
        filtros.respSimulado = respSimuladoSelecionado;
      }
    }

    if (this.multiSelectQuestoesComentadas.length) {
      const questaoComentadaSelecionada = this.multiSelectQuestoesComentadas
        .map((questaoComentada) => this.obterQuestaoComentadaEnum(questaoComentada))
        .filter((enumQuestaoComentada) => enumQuestaoComentada !== undefined);

      if (questaoComentadaSelecionada) filtros.comentada = questaoComentadaSelecionada;
    }

    if (this.multiSelectTemasSubtemasSelecionados && this.multiSelectTemasSubtemasSelecionados.length > 0) {
      const temasSelecionados: string[] = [];
      const subtemasSelecionados: string[] = [];

      for (const item of this.multiSelectTemasSubtemasSelecionados) {
        if (typeof item === 'string' && item.startsWith('TEMA_')) {
          const temaOriginal = item.substring(5);

          temasSelecionados.push(temaOriginal);

        } else {
          subtemasSelecionados.push(item);
        }
      }

      if (temasSelecionados.length > 0) {
        filtros.tema = temasSelecionados;
      }

      if (subtemasSelecionados.length > 0) {
        filtros.subtema = subtemasSelecionados;
      }

    }

    console.log(filtros);

    // Verificar se a palavra-chave está preenchida
    if (this.palavraChave && this.palavraChave.trim() !== '') {
      filtros.palavraChave = this.palavraChave.trim();
    }


    if (Object.keys(filtros).length === 0) {
      this.message = 'Por favor, selecione pelo menos um filtro.';
      this.questoes = [];
      return;
    }


    this.questoesService.filtrarQuestoes(this.usuarioId, filtros, 0, 0).subscribe(
      (questoes: Questao[]) => {
        if (questoes.length === 0) {
          this.message = this.getMensagemNenhumaQuestaoEncontrada(filtros);
          this.questoes = [];
          this.questaoAtual = null;
        } else {
          this.message = '';
          this.questoes = questoes;
          this.paginaAtual = 0;
          this.questaoAtual = this.questoes[this.paginaAtual];

          this.navegacaoPorQuestao = this.questoes.map((questao, index) => ({
            questao: questao,
            index: index,
          }));

          this.buscarCuriosidadesSeNecessario();
          this.toggleFiltros();
        }

        this.resposta = '';
        this.mostrarGabarito = false;
        this.numeroDeQuestoes = questoes.length;
        this.carregando = false;
        this.questoesStateService.setQuestaoAtual(this.questaoAtual);
        this.questoesService.setQuestoesFiltradas(questoes);
      },
      (error) => {
        console.error('Erro ao filtrar questões:', error);
        if (error.status === 403) {
          this.message = 'Usuários com conta gratuita têm acesso limitado a questões de 2023 a 2025.';
        } else {
          this.message = 'Ocorreu um erro ao filtrar questões. Por favor, tente novamente mais tarde.';
        }
        this.carregando = false;
      }
    );
  }


  private buscarRespostaSalva(questaoId: number): void {
    if (!this.usuarioId || !questaoId) {
      return;
    }

    if (this.filtroIdRespondendo > 0) {
      this.questoesService.questaoRespondida(this.usuarioId, questaoId, 0, this.filtroIdRespondendo).subscribe({
        next: (resposta) => {
          if (resposta) {
            this.verificarRespostaUsuario(resposta);
            this.jaRespondeu = true;
            this.mostrarPorcentagem = true;
          }
        },
        error: (error) => {
          console.error(`Erro ao buscar resposta salva para a questão ${questaoId}:`, error);
        }
      });
    } else {
      this.jaRespondeu = false;
      this.mostrarPorcentagem = false;
      this.respostaVerificada = false;
      this.respostaCorreta = null;
      this.respostaErrada = null;
      this.selectedOption = '';
      this.isRespostaCorreta = false;
    }
  }


  selecionarQuestao(event: Event): void {
    this.resetarOcorrenciasDeQuestao();

    const target = event.target as HTMLSelectElement;
    const index = Number(target.value);

    this.paginaAtual = index;
    this.questaoAtual = this.questoes[this.paginaAtual];
    this.questoesStateService.setQuestaoAtual(this.questaoAtual);


    this.buscarRespostaSalva(this.questaoAtual.id);
  }


  getMensagemNenhumaQuestaoEncontrada(filtros: any): string {
    let mensagemUsuarioTratamento = 'Nenhuma questão encontrada com os filtros selecionados: ';

    if (filtros.ano) {
      mensagemUsuarioTratamento += `Ano: ${this.getDescricoesAno(filtros.ano)}, `;
    }
    if (filtros.dificuldade) {
      mensagemUsuarioTratamento += `Dificuldade: ${this.getDescricoesDificuldade(filtros.dificuldade)}, `;
    }
    if (filtros.tipoDeProva) {
      mensagemUsuarioTratamento += `Tipo de Prova: ${this.getDescricoesTipoDeProva(filtros.tipoDeProva)}, `;
    }
    if (filtros.subtema) {
      mensagemUsuarioTratamento += `Subtema: ${this.getDescricoesSubtema(filtros.subtema)}, `;
    }
    if (filtros.tema) {
      mensagemUsuarioTratamento += `Tema: ${this.getDescricoesTema(filtros.tema)}, `;
    }
    if (filtros.palavraChave) {
      mensagemUsuarioTratamento += `Palavra-chave: ${filtros.palavraChave}, `;
    }
    if (filtros.respSimulado) {
      mensagemUsuarioTratamento += `Respostas: ${this.getDescricoesRespSimulado(filtros.respSimulado)}, `;
    }
    if (filtros.certoErrado) {
      mensagemUsuarioTratamento += `Questões: ${this.getDescricaoCertoErrado(filtros.certoErrado)}, `;
    }
    if (filtros.comentada) {
      mensagemUsuarioTratamento += `Questões: ${this.getDescricaoQuestoesComentadas(filtros.comentada)}, `;

    }

    return mensagemUsuarioTratamento.slice(0, -2) + '.';
  }


  verificarRespostaUsuario(resposta: Resposta) {
    this.selectedOption = resposta.opcaoSelecionada;
    this.isRespostaCorreta = resposta.correct;

    if (resposta.correct) {
      this.respostaCorreta = this.selectedOption;
      this.respostaErrada = '';
    } else {
      this.respostaErrada = this.selectedOption;
      this.respostaCorreta = resposta.opcaoCorreta;
    }
    this.respostaVerificada = true;
  }


  exibirGabarito(): void {
    if (!this.questaoAtual) {
      console.warn('Nenhuma questão atual disponível.');
      return;
    }

    this.mostrarGabarito = true;

    const imagens = [
      this.questaoAtual.fotoDaRespostaUmUrl,
      this.questaoAtual.fotoDaRespostaDoisUrl,
      this.questaoAtual.fotoDaRespostaTresUrl,
      this.questaoAtual.fotoDaRespostaQuatroUrl,
      this.questaoAtual.fotoDaRespostaCincoUrl
    ];

    imagens.forEach((url, index) => {
      if (url) {
        console.log(`Imagem ${index + 1} carregada:`, url);
      } else {
        console.warn(`Imagem ${index + 1} não disponível.`);
      }
    });
  }


  anteriorQuestao() {
    if (this.paginaAtual > 0) {
      this.paginaAtual--;
      this.questaoAtual = this.questoes[this.paginaAtual];

      this.resetarOcorrenciasDeQuestao();
      this.questoesStateService.setQuestaoAtual(this.questaoAtual);
      this.fecharBalloon();
      this.carregarRespostaSeNecessario(this.questaoAtual.id);


      this.buscarRespostaSalva(this.questaoAtual.id);
      this.buscarCuriosidadesSeNecessario();
    } else {
      this.exibirMensagem('Você já está na primeira questão.', 'erro');
    }
  }


  proximaQuestao() {
    if (this.paginaAtual < this.questoes.length - 1) {
      this.paginaAtual++;
      this.questaoAtual = this.questoes[this.paginaAtual];

      this.resetarOcorrenciasDeQuestao();
      this.questoesStateService.setQuestaoAtual(this.questaoAtual);
      this.fecharBalloon();
      this.carregarRespostaSeNecessario(this.questaoAtual.id);

      this.buscarRespostaSalva(this.questaoAtual.id);
      this.buscarCuriosidadesSeNecessario();
    } else {
      this.exibirMensagem('Não há mais questões neste filtro.', 'erro');
    }
  }


  responderQuestao(questao: Questao | null): void {
    if (!this.jaRespondeu) {  // Verificar se o usuário já respondeu
      if (!questao) {
        console.error('Questão atual é nula.');
        this.resposta = 'Nenhuma questão selecionada.';
        return;
      }

      if (this.selectedOption) {
        const alternativaSelecionada = questao.alternativas.find(
          (a) => a.texto === this.selectedOption
        );

        if (alternativaSelecionada) {
          const respostaDTO: RespostaDTO = {
            questaoId: questao.id,
            filtroId: this.filtroIdRespondendo,
            selecionarOpcao: this.selectedOption,
          };

          const idUser = parseInt(this.usuario.id);
          this.respondidasAgora.add(questao.id);

          // Salvar resposta na sessão local para envio posterior
          if (!this.respostasSessao) {
            this.respostasSessao = {
              questoesIds: [],
              idUsuario: idUser,
              respostas: []
            };
          }

          this.respostasSessao.questoesIds.push(questao.id);
          this.respostasSessao.idUsuario = idUser;
          this.respostasSessao.respostas.push(respostaDTO);

          // Chamamos o serviço para verificar a resposta
          this.questoesService.checkAnswer(questao.id, idUser, respostaDTO).subscribe(
            (resposta: Resposta) => {
              this.isRespostaCorreta = resposta.correct;
              this.respostaVerificada = true; // Verificação foi realizada
              this.resposta = resposta.correct
                ? 'Resposta correta!'
                : 'Resposta incorreta. Tente novamente.';

              // Marque que o usuário já respondeu para desativar o botão
              this.jaRespondeu = true;

              // Verificar a resposta do usuário e exibir o resultado
              this.verificarRespostaUsuario(resposta);

              // Exibe a barra de porcentagem após o usuário responder
              this.mostrarPorcentagem = true;

              // Atualizar manualmente as porcentagens no front-end
              if (this.porcentagens) {
                const currentPercentageString = this.porcentagens.get(this.selectedOption) || '0%';
                const currentPercentage = parseFloat(currentPercentageString.replace('%', ''));
                const newPercentage = currentPercentage + 1;
                this.porcentagens.set(this.selectedOption, `${newPercentage}%`);
              } else {
                this.porcentagens = new Map([[this.selectedOption, '1%']]);
              }

              // Após enviar a resposta, obtenha as porcentagens de respostas
              this.questoesService.getAcertosErrosQuestao(questao.id).subscribe(
                (data) => {
                  this.porcentagens = new Map(Object.entries(data));
                },
                (error) => {
                  console.error('Erro ao obter acertos e erros da questão:', error);
                }
              );
            },
            (error) => {
              this.resposta =
                'Ocorreu um erro ao verificar a resposta. Por favor, tente novamente mais tarde.';
            }
          );
        }
      }
    }
  }


  abrirModal(): void {
    const modalElement = document.getElementById('confirmacaoModal');
    const modal = new bootstrap.Modal(modalElement!);
    modal.show();
    modalElement?.addEventListener('hidden.bs.modal', () => {
      this.fecharCardConfirmacao();
    });
  }

  confirmarSalvarFiltro(nomeFiltro: string, descricaoFiltro: string): void {
    if (!nomeFiltro) {
      this.exibirMensagem('O campo "Nome" é obrigatório.', 'erro');
      this.fecharCardConfirmacao();
      return;
    }

    if (this.questoes.length === 0) {
      this.exibirMensagem('É necessário selecionar questões', 'erro');
      this.fecharCardConfirmacao();
      return;
    }

    console.log(this.questoes);

    this.multSelectTema = [];
    this.multSelectSubtema = [];

    for (const item of this.multiSelectTemasSubtemasSelecionados) {
      if (item.startsWith('TEMA_')) {
        const temaOriginal = item.substring(5) as Tema;
        if (!this.multSelectTema.includes(temaOriginal)) {
          this.multSelectTema.push(temaOriginal);
        }
      } else {
        this.multSelectSubtema.push(item as unknown as Subtema);
      }
    }

    this.filtroASalvar = {
      nome: nomeFiltro,
      assunto: descricaoFiltro,
      ano: this.mapearDescricoesParaEnums(this.multSelectAno, AnoDescricoes),
      dificuldade: this.mapearDescricoesParaEnums(this.multSelecDificuldade, DificuldadeDescricoes),
      tipoDeProva: this.mapearDescricoesParaEnums(this.multSelectTipoDeProva, TipoDeProvaDescricoes),
      subtema: this.multSelectSubtema,
      tema: this.multSelectTema,
      respostasSimulado: this.mapearDescricoesParaEnums(this.multiSelectRespSimu, RespostasSimuladosDescricao),
      certasErradas: this.mapearDescricoesParaEnums(this.multiSelectCertoErrado, CertasErradasDescricao),
      comentada: this.mapearDescricoesParaEnums(this.multiSelectQuestoesComentadas, ComentadasDescricao),
      questaoIds: this.questoes.map(q => q.id),
    };

    const idUser = this.idAlunoMentorado ? parseInt(this.idAlunoMentorado) : parseInt(this.usuario.id);

    this.carregandoSalvar = true;

    this.filtroService.salvarFiltro(this.filtroASalvar, idUser).pipe(
      switchMap(responseDoFiltro => {
        const novoFiltroId = responseDoFiltro.id;

        this.exibirMensagem('O filtro foi salvo com sucesso!', 'sucesso');

        const modalElement = document.getElementById('confirmacaoModal');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance?.hide();
        }

        if (this.respostasSessao && this.respostasSessao.respostas.length > 0) {
          this.respostasSessao.respostas.forEach(resposta => {
            resposta.filtroId = novoFiltroId;
          });

          const payloadRespostas = {
            ...this.respostasSessao,
            questoesIds: Array.from(this.respostasSessao.questoesIds)
          };

          return this.filtroService.salvarQuestoesEmSessao(payloadRespostas);
        }

        return of(null);
      })
    ).subscribe({
      next: (resultadoDaSessao) => {
        if (resultadoDaSessao) {
          console.log('Respostas da sessão também foram salvas com sucesso:', resultadoDaSessao);
          this.respostasSessao = null;
        } else {
          console.log('Filtro salvo. Nenhuma resposta de sessão para persistir.');
        }
        this.carregandoSalvar = false;
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Ocorreu um erro ao salvar os dados. Por favor, tente novamente.';
        this.exibirMensagem(errorMessage, 'erro');
        this.carregandoSalvar = false;
      }
    });
  }

  private mapearDescricoesParaEnums(selecoes: string[], descricoesEnum: any): string[] {
    if (!selecoes || selecoes.length === 0) return [];
    return selecoes
      .map((descricao) => Object.keys(descricoesEnum).find((key) => descricoesEnum[key] === descricao))
      .filter((enumValue) => enumValue !== undefined) as string[];
  }


  mensagem: { texto: string; tipo: string } | null = null;

  exibirMensagem(texto: string, tipo: 'sucesso' | 'erro'): void {
    this.mensagem = { texto, tipo };
    setTimeout(() => {
      this.mensagem = null;
    }, 5000); // A mensagem desaparece após 5 segundos
  }


  fecharCardConfirmacao(): void {
    this.mostrarCardConfirmacao = false;
  }

  loadQuestao(): void {
    if (this.questoes.length > 0 && this.questaoAtual?.id) {
      const questaoId = this.questaoAtual.id;
      this.questoesService.getQuestaoById(questaoId).subscribe(
        (data: Questao) => {
          this.questaoAtual = data;
          this.processarQuestaoAtual();
          this.carregarRespostaSeNecessario(questaoId);
          this.questoesStateService.setQuestaoAtual(this.questaoAtual);
        },
        (error) => {
          console.error('Erro ao carregar questão específica:', error);
          this.message = 'Erro ao carregar questão. Por favor, tente novamente.';
        }
      );
    }
  }

  processarQuestaoAtual(): void {
    if (this.questaoAtual) {
      this.comentarioDaQuestaoSanitizado = this.sanitizer.bypassSecurityTrustHtml(
        this.questaoAtual.comentarioDaQuestao || ''
      );
      this.sanitizerEnunciado = this.applyClassesToEnunciado(
        this.questaoAtual.enunciadoDaQuestao || ''
      );
    }
  }

  resetarOcorrenciasDeQuestao(): void {
    this.jaRespondeu = false;
    this.resposta = '';
    this.mensagemErro = '';
    this.selectedOption = '';
    this.isRespostaCorreta = false;
    this.mostrarGabarito = false;
    this.respostaCorreta = '';
    this.respostaErrada = '';
    this.respostaVerificada = false;
    this.mostrarPorcentagem = false;
    this.porcentagemAcertos = 0;

  }

  private carregarRespostaSeNecessario(questaoId: number): void {
    if (this.respondidasAgora.has(questaoId)) {
      this.questoesService.questaoRespondida(this.usuarioId, questaoId, 0).subscribe({
        next: (resposta) => {
          if (resposta) {
            this.verificarRespostaUsuario(resposta);
            this.jaRespondeu = true;
            this.mostrarPorcentagem = true;
          }
        },
        error: (error) => {
          console.error("Erro ao verificar a resposta do usuário", error);
        }
      });
    }
  }

  isImage(url: string | null): boolean {
    return typeof url === 'string' && /\.(jpeg|jpg|gif|png)$/i.test(url);
  }

  isVideo(url: string | null): boolean {
    return typeof url === 'string' && /\.(mp4|webm|ogg)$/i.test(url);
  }

  sanitizeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  removeAno(ano: any): void {
    this.multSelectAno = this.multSelectAno.filter(item => item !== ano);
  }

  isAdmin(): boolean {
    return this.usuarioLogado?.permissao === 'ROLE_ADMIN';
  }

  isProf(): boolean {
    return this.usuarioLogado?.permissao === 'ROLE_PROFESSOR';
  }

  editQuestao(): void {
    if (this.questaoAtual?.id) {
      const filtroState = {
        multSelectAno: this.multSelectAno,
        multSelecDificuldade: this.multSelecDificuldade,
        multSelectTipoDeProva: this.multSelectTipoDeProva,
        multSelectSubtema: this.multSelectSubtema,
        multSelectTema: this.multSelectTema,
        multiSelectTemasSubtemasSelecionados: this.multiSelectTemasSubtemasSelecionados,
        multiSelectCertoErrado: this.multiSelectCertoErrado,
        multiSelectRespSimu: this.multiSelectRespSimu,
        palavraChave: this.palavraChave,
        questaoId: this.questaoAtual.id,
        paginaAtual: this.paginaAtual
      };

      localStorage.setItem('questoesFiltroState', JSON.stringify(filtroState));

      this.navigateService.navigateTo(`/usuario/cadastro-questao/${this.questaoAtual.id}`, '/usuario/questoes');
    }
  }

  aplicarFiltrosRestaurados(questaoId: number): void {
    this.carregando = true;

    const filtros: any = {};

    // Construa o objeto filtros com os valores restaurados
    if (this.multSelectAno.length) {
      const anosSelecionados = this.multSelectAno
        .map((ano) => this.obterAnoEnum(ano))
        .filter((enumAno) => enumAno !== undefined);
      if (anosSelecionados.length > 0) filtros.ano = anosSelecionados;
    }

    if (this.multSelecDificuldade.length) {
      const dificuldadeSelecionada = this.multSelecDificuldade
        .map((dificuldade) => this.obterDificuldadeEnum(dificuldade))
        .filter((enumDificuldade) => enumDificuldade !== undefined);
      if (dificuldadeSelecionada.length > 0) filtros.dificuldade = dificuldadeSelecionada;
    }

    if (this.multSelectTipoDeProva.length) {
      const tipoDeProvaSelecionado = this.multSelectTipoDeProva
        .map((tipoDeProva) => this.obterTipoDeProvaEnum(tipoDeProva))
        .filter((enumTipoDeProva) => enumTipoDeProva !== undefined);
      if (tipoDeProvaSelecionado.length > 0) filtros.tipoDeProva = tipoDeProvaSelecionado;
    }

    if (this.multiSelectQuestoesComentadas.length) {
      const questaoComentadaSelecionada = this.multiSelectQuestoesComentadas
        .map((questaoComentada) => this.obterQuestaoComentadaEnum(questaoComentada))
        .filter((enumQuestaoComentada) => enumQuestaoComentada !== undefined);

      if (questaoComentadaSelecionada.length > 0) filtros.comentada = questaoComentadaSelecionada;
    }

    if (this.multSelectSubtema.length) {
      const subtemaSelecionado = this.multSelectSubtema
        .map((subtema) => this.obterSubtemaEnum(subtema))
        .filter((enumSubtema) => enumSubtema !== undefined);
      if (subtemaSelecionado.length > 0) filtros.subtema = subtemaSelecionado;
    }

    if (this.multSelectTema.length) {
      const temaSelecionado = this.multSelectTema
        .map((tema) => this.obterTemaEnum(tema))
        .filter((enumTema) => enumTema !== undefined);
      if (temaSelecionado.length > 0) filtros.tema = temaSelecionado;
    }

    if (this.multiSelectCertoErrado.length) {
      const certoErradoSelecionado = this.multiSelectCertoErrado
        .map((certoErrado) => this.obterCertoErradoEnum(certoErrado))
        .filter((enumCertoErrado) => enumCertoErrado !== undefined);
      if (certoErradoSelecionado.length > 0) filtros.certoErrado = certoErradoSelecionado;
    }

    if (this.multiSelectRespSimu.length) {
      const respSimuladoSelecionado = this.multiSelectRespSimu
        .map((respSimu) => this.obterRespSimuladoEnum(respSimu))
        .filter((enumRespSimu) => enumRespSimu !== undefined);
      if (respSimuladoSelecionado.length > 0) filtros.respSimulado = respSimuladoSelecionado;
    }

    if (this.multiSelectTemasSubtemasSelecionados.length) {
      const temasSelecionados: string[] = [];
      const subtemasSelecionados: string[] = [];


      for (const item of this.multiSelectTemasSubtemasSelecionados) {
        if (typeof item === 'string') {
          if (this.isTema(item)) {
            temasSelecionados.push(item);
          } else if (this.isSubtema(item)) {
            subtemasSelecionados.push(item);
          }
        }
      }

      if (temasSelecionados.length) {
        filtros.tema = temasSelecionados;
      }

      if (subtemasSelecionados.length) {
        filtros.subtema = subtemasSelecionados

      }
    }

    if (this.palavraChave && this.palavraChave.trim() !== '') {
      filtros.palavraChave = this.palavraChave.trim();
    }

    if (Object.keys(filtros).length === 0) {
      this.carregando = false;
      this.loadQuestao();
      return;
    }

    this.questoesService.filtrarQuestoes(this.usuarioId, filtros, 0, 0).subscribe(
      (questoes: Questao[]) => {
        if (questoes.length > 0) {
          this.toggleFiltros();
          this.questoes = questoes;
          this.numeroDeQuestoes = questoes.length;

          this.navegacaoPorQuestao = this.questoes.map((q, index) => ({
            questao: q,
            index: index,
          }));

          const index = this.questoes.findIndex(q => q.id === questaoId);
          if (index >= 0) {
            this.paginaAtual = index;
            this.questaoAtual = this.questoes[index];
            this.carregarRespostaSeNecessario(this.questaoAtual.id);
            this.questoesStateService.setQuestaoAtual(this.questaoAtual);
          } else {
            this.paginaAtual = 0;
            this.questaoAtual = this.questoes[0];
          }
        } else {
          this.message = "Nenhuma questão encontrada com os filtros anteriores.";
          this.loadQuestao();
        }
        this.carregando = false;
      },
      (error) => {
        console.error('Erro ao restaurar filtros:', error);
        this.message = 'Erro ao restaurar filtros anteriores.';
        this.carregando = false;
        this.loadQuestao();
      }
    );
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  verificarBloqueioFiltros(): void {
    const tiposEspeciais = ['AAO', 'ICO/FRCOphto'];
    this.filtrosBloqueados = this.multSelectTipoDeProva.some(tipo => tiposEspeciais.includes(tipo));
    if (this.filtrosBloqueados) {   //filtros a serem limpos
      this.multSelectAno = [];
    }
  }

  onTipoDeProvaChange(): void {
    this.verificarBloqueioFiltros();
  }

  isFiltroBloqueado(): boolean {
    return this.filtrosBloqueados;
  }

  buscarCuriosidadesSeNecessario(): void {
    const idQuestao = this.questaoAtual?.id;

    if (idQuestao && !this.isTrialUser) {

      this.questoesService.getCuriosidades(idQuestao).subscribe(
        (curiosidades: CuriosidadeResponse[]) => {

          this.curiosidades = curiosidades
            .filter(c => c.mensagem === 'success' && this.temDadosValidosCuriosidade(c))
            .slice(0, 3);

          this.curiosidadeAtual = 0;

          setTimeout(() => {
            if (this.curiosidades.length > 0) {
              this.mostrarBalloon = true;
            }
          }, 2000);
        },
        (error) => {
          console.error('Erro ao buscar curiosidades:', error);
        }
      );
    }
  }

  fecharBalloon(): void {
    this.mostrarBalloon = false;
    this.curiosidades = [];
    this.curiosidadeAtual = 0;
  }

  proximaCuriosidade(): void {
    if (this.curiosidadeAtual < this.curiosidades.length - 1) {
      this.curiosidadeAtual++;
    }
  }

  curiosidadeAnterior(): void {
    if (this.curiosidadeAtual > 0) {
      this.curiosidadeAtual--;
    }
  }

  temDadosValidosCuriosidade(curiosidade: CuriosidadeResponse): boolean {
    return curiosidade &&
      curiosidade.dadosCuriosidade &&
      curiosidade.dadosCuriosidade.length > 0 &&
      curiosidade.mensagem === 'success';
  }

  formatarMensagemCuriosidade(curiosidade: CuriosidadeResponse): string {
    if (!this.temDadosValidosCuriosidade(curiosidade)) {
      return 'Dados não disponíveis para este subtema.';
    }

    const dados = curiosidade.dadosCuriosidade[0];
    const porcentagemFormatada = dados.porcentagem.toFixed(1);

    const nomeSubtemaFormatado = this.getDescricaoSubtemaFormatada(curiosidade.subtema);
    const tipoDeProvaFormatado = curiosidade.tipoDeProva;

    let periodo = '';
    if (curiosidade.anos && curiosidade.anos.length > 1) {
      periodo = 'nos últimos três anos';
    } else if (curiosidade.anos && curiosidade.anos.length === 1) {
      periodo = `no ano "${curiosidade.anos[0]}"`;
    }

    if (dados.qtdQuestoes === 0) {
      return `O subtema "${nomeSubtemaFormatado}" não possui questões cadastradas para "${tipoDeProvaFormatado}" ${periodo}. (${dados.totalQuestoes} questões no total).`;
    }

    return `O subtema "${nomeSubtemaFormatado}" representa ${porcentagemFormatada}% das questões de "${tipoDeProvaFormatado}" ${periodo}. (${dados.qtdQuestoes} de ${dados.totalQuestoes} questões).`;
  }

  getDescricaoSubtemaFormatada(subtema: string): string {

    const subtemaEnum = Object.values(Subtema).find(s => s === subtema);
    if (subtemaEnum) {
      return this.getDescricaoSubtema(subtemaEnum);
    }

    return subtema.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getCuriosidadeAtual(): CuriosidadeResponse | null {
    return this.curiosidades[this.curiosidadeAtual] || null;
  }

  fecharPopupMentoria(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}