import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, HostListener, OnDestroy, Inject, Optional } from '@angular/core';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva';
import {
  getDescricaoAno,
  getDescricaoDificuldade,
  getDescricaoSubtema,
  getDescricaoTema,
  getDescricaoTipoDeProva,
  getDescricaoQuantidadeDeQuestoesSelecionadas,
  getDescricaoRespostasSimulado,
} from '../page-questoes/enums/enum-utils';
import { Ano } from '../page-questoes/enums/ano';
import { Dificuldade } from '../page-questoes/enums/dificuldade';
import { Subtema } from '../page-questoes/enums/subtema';
import { Tema } from '../page-questoes/enums/tema';
import { Questao } from '../page-questoes/questao';
import { QuestoesService } from 'src/app/services/questoes.service';
import { Filtro } from '../filtro';
import { DificuldadeDescricoes } from '../page-questoes/enums/dificuldade-descricao';
import { TipoDeProvaDescricoes } from '../page-questoes/enums/tipodeprova-descricao';
import { SubtemaDescricoes } from '../page-questoes/enums/subtema-descricao';
import { AnoDescricoes } from '../page-questoes/enums/ano-descricoes';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { FiltroService } from 'src/app/services/filtro.service';
import { RespostaDTO } from '../RespostaDTO';
import { Resposta } from '../Resposta';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/login/usuario';
import { SimuladoService } from 'src/app/services/simulado.service';
import { QuestoesStateService } from 'src/app/services/questao-state.service';
import { QuantidadeDeQuestoesSelecionadas } from '../page-questoes/enums/quant-questoes';
import { RespostasSimulado } from '../page-questoes/enums/resp-simu';
import Chart from 'chart.js';
import { NavigationEnd, Router } from '@angular/router';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from '@angular/platform-browser';

import { temasESubtemas } from '../page-questoes/enums/map-tema-subtema';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { StatusSimulado } from '../meus-simulados/status-simulado';
import { forkJoin, Observable, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Simulado } from '../simulado';

declare var bootstrap: any;

@Component({
  selector: 'app-page-simulado',
  templateUrl: './page-simulado.component.html',
  styleUrls: ['./page-simulado.component.css'],
})
export class PageSimuladoComponent implements OnInit, OnDestroy {
  carregando: boolean = false;
  nomeSimulado: string = '';
  descricaoSimulado: string = '';

  mensagemDeAviso!: string;

  tempo: number = 0; // Contador de tempo em segundos
  tempoRestanteQuestaoSimulado: number = 160; // Tempo restante para responder uma questao do simulado
  radioDisabled: boolean = false;
  intervalId: any; // Armazena o ID do intervalo para controlar o timer
  intervalContagemRegressiva: any;
  isSimuladoIniciado: boolean = false; // Controla se o simulado foi iniciado ou não

  questao: Questao = new Questao();
  idsQuestoes: number[] = [];
  selectedOption: string = '';

  usuario!: Usuario;
  usuarioLogado: Usuario | null = null;
  usuarioId!: number;

  porcentagemAcertos: number = 0;
  acertos: number = 0;
  totalQuestoes: number = 0;
  numQuestaoAtual: number = 1;

  @ViewChild('confirmacaoModalRef', { static: false })
  confirmacaoModal!: ElementRef;

  nomeFiltro: string = '';
  descricaoFiltro: string = '';
  filtrosBloqueados: boolean = false;

  tiposDeProva = Object.values(TipoDeProva);
  anos = Object.values(Ano);
  dificuldades = Object.values(Dificuldade);
  subtemas = Object.values(Subtema);
  temas = Object.values(Tema);
  quantidadeDeQuestoesSelecionadas = Object.values(
    QuantidadeDeQuestoesSelecionadas
  );
  respostasSimulado = Object.values(RespostasSimulado);

  message: string = '';
  resposta: string = '';

  respostas: any[] = []; // Array que armazena as respostas do usuário
  respostasList: any[] = [];
  chart: any;
  alertaVisivel = false;

  questaoAtual: Questao | null = null;
  carregandoSimulado: boolean = false; // <-- ADICIONE ESTA LINHA
  paginaAtual: number = 0;
  filtros: any = {
    ano: null,
    dificuldade: null,
    tipoDeProva: null,
    subtema: null,
    tema: null,
    palavraChave: null,
    quantidadeDeQuestoesSelecionadas: null,
    respostasSimulado: null,
  };

  mostrarCardConfirmacao = false;
  filtroASalvar!: Filtro;

  mostrarGabarito: boolean = false;

  multiSelectedAno: Ano[] = [];
  multiSelectedDificuldade: Dificuldade[] = [];
  multiSelectedTipoDeProva: TipoDeProva[] = [];
  multiSelectedSubtema: Subtema[] = [];
  multiSelectedTema: Tema[] = [];
  palavraChave: string = '';
  selectedQuantidadeDeQuestoesSelecionadas: QuantidadeDeQuestoesSelecionadas | null =
    null;
  selectedRespostasSimulado: RespostasSimulado | null = null;

  multiSelectTemasSubtemasSelecionados: Subtema[] = [];
  subtemasAgrupadosPorTema: {
    label: string;
    value: string;
    options: { label: string; value: Subtema }[];
  }[] = [];

  questoes: Questao[] = [];
  isFiltered = false;
  p: number = 1;
  mensagemSucesso: string = '';

  isRespostaCorreta: boolean = false;
  respostaCorreta: string = '';
  respostaErrada: string = '';
  respostaVerificada: boolean = false;
  jaRespondeu: boolean = false;
  questaoRespondida: boolean = false;
  visualizando: boolean = false;
  realizandoSimulado: boolean = true;
  revisandoSimulado: boolean = false;

  dados: any;
  questaoDTO = new Questao();
  selectedAlternativeIndex: number = -3;

  simuladoIniciado = false;
  simuladoFinalizado = false;
  tempoTotal: number = 0;
  simuladoIdInicial: number = 0;
  simuladoIdRespondendo: number = 0;

  tiposDeProvaDescricoes: string[] = [];
  anosDescricoes: string[] = [];
  dificuldadesDescricoes: string[] = [];
  subtemasDescricoes: string[] = [];
  temasDescricoes: string[] = [];
  quantidadeDeQuestoesSelecionadasDescricoes: string[] = [];
  respostasSimuladoDescricao: string[] = [];
  idSimuladoRespondendo: number | null = null;
  idAlunoMentorado: string = '';
  nomeAlunoMentorado: string = '';
  simuladoMentorado: Simulado | null = null;

  mostrarFiltros: boolean = false;

  isMeuSimulado: boolean = false;

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService,
    private simuladoService: SimuladoService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private questoesStateService: QuestoesStateService,
    @Optional() public dialogRef: MatDialogRef<PageSimuladoComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { alunoId: string, nomeAluno: string, simulado: Simulado } | null
  ) {
    this.idAlunoMentorado = data?.alunoId || '';
    this.nomeAlunoMentorado = data?.nomeAluno || '';
    this.simuladoMentorado = data?.simulado || null;
  }

  ngOnInit() {
    this.usuarioLogado = this.authService.getUsuarioAutenticado();

    this.carregarDadosIniciais();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (!this.router.url.includes('/simulado')) {
        this.simuladoService.simuladoFinalizado();
      }
    });

  }

  ngOnDestroy(): void {
    // if (this.isSimuladoIniciado && !this.simuladoFinalizado) {
    //   this.finalizarSimulado();
    // }

    this.questoesStateService.setQuestaoAtual(null);

    // this.salvarTempoAtual();

    // if (this.intervalId) {
    //   clearInterval(this.intervalId);
    // }
    // if (this.intervalContagemRegressiva) {
    //   clearInterval(this.intervalContagemRegressiva);
    // }
  }

  salvarTempoAtual(): void {
    if (this.isSimuladoIniciado && !this.simuladoFinalizado && this.simuladoIdRespondendo > 0) {
      console.log(`Salvando tempo: ${this.tempo}s para o simulado ${this.simuladoIdRespondendo}`);

      this.simuladoService.atualizarTempoSimulado(this.simuladoIdRespondendo, this.tempo)
        .subscribe({
          next: () => console.log('Tempo salvo com sucesso.'),
          error: (err) => console.error('Erro ao salvar o tempo:', err)
        });
    }
  }

  async carregarDadosIniciais() {
    try {
      await this.obterPerfilUsuario();
      this.dados = this.obterDados();
      this.carregarFiltrosEDescricoes();

      const meuSimulado = this.simuladoMentorado ?? history.state.simulado;
      this.simuladoIdInicial = meuSimulado?.id;

      if (meuSimulado) {
        this.toggleFiltros();
        this.simuladoIdRespondendo = meuSimulado.id;
        this.idSimuladoRespondendo = meuSimulado.id;
        const status = meuSimulado.statusSimulado as StatusSimulado;
        this.prepararSimulado(meuSimulado, status);
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  }

  private prepararSimulado(meuSimulado: any, status: StatusSimulado) {
    this.isMeuSimulado = true;
    this.questoes = meuSimulado.questoes;
    this.totalQuestoes = this.questoes.length;


    if (!this.questoes || this.questoes.length === 0) {
      this.message = "Erro: As questões para este simulado não puderam ser carregadas.";
      return;
    }

    this.idsQuestoes = this.questoes.map((q) => q.id);
    this.resposta = '';

    const tempoSalvo = meuSimulado.tempoDecorrido || 0;

    if (status === StatusSimulado.EM_ANDAMENTO) {
      this.carregandoSimulado = true;
      this.realizandoSimulado = true;
      this.isSimuladoIniciado = true;
      this.isMeuSimulado = false;

      this.carregarRespostasPreviamente().subscribe(() => {
        this.visualizando = false;
        this.jaRespondeu = false;

        let proximaPagina = 0;
        let todasRespondidas = true;
        for (let i = 0; i < this.questoes.length; i++) {
          if (!this.respostas[i]) {
            proximaPagina = i;
            todasRespondidas = false;
            break;
          }
        }
        this.numQuestaoAtual = proximaPagina + 1;
        if (todasRespondidas) { proximaPagina = this.questoes.length - 1; }

        this.paginaAtual = proximaPagina;
        this.questaoAtual = this.questoes[this.paginaAtual];
        this.carregarRespostaAnterior();
        this.iniciarSimulado(tempoSalvo);
        this.contagemRegressivaSimuladoQuestao();
        this.carregandoSimulado = false;

        this.atualizarQuestaoAtual();

        this.cdr.detectChanges();
      });

    } else if (status === StatusSimulado.FINALIZADO) {
      this.visualizando = true;
      this.jaRespondeu = true;
      this.realizandoSimulado = false;
      this.paginaAtual = 0;
      this.questaoAtual = this.questoes[this.paginaAtual];
      this.visualizarSimulado();
      this.tempo = tempoSalvo;
      this.tempoTotal = tempoSalvo;

      this.atualizarQuestaoAtual();

      this.cdr.detectChanges();

      this.carregarRespostasPreviamente().subscribe(() => {
        this.respostaQuestao(this.questoes[this.paginaAtual].id, this.simuladoIdInicial);
        this.cdr.detectChanges();
      });

    } else if (status === StatusSimulado.NAO_INICIADO) {
      this.isMeuSimulado = false;
      this.simuladoService.iniciarSimulado(meuSimulado.id);
      this.visualizando = false;
      this.jaRespondeu = false;
      this.realizandoSimulado = true;
      this.paginaAtual = 0;
      this.questaoAtual = this.questoes[this.paginaAtual];
      this.iniciarSimulado(0);
      this.contagemRegressivaSimuladoQuestao();

      // Atualizar a questão atual no serviço de estado
      this.atualizarQuestaoAtual();

      this.cdr.detectChanges();
    }
  }


  finalizarSimulado() {
    this.salvarTempoAtual();

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.intervalContagemRegressiva) {
      clearInterval(this.intervalContagemRegressiva);
      this.intervalContagemRegressiva = null;
    }

    this.tempoTotal = this.tempo;

    this.totalQuestoes = this.questoes.length;

    this.simuladoService
      .finalizarSimulado(this.usuarioId, this.simuladoIdRespondendo, this.respostasList)
      .subscribe((resultado) => {
        this.gerarGrafico(resultado.acertos, resultado.erros, this.totalQuestoes);
      });

    this.simuladoService.simuladoFinalizado();
    this.simuladoIniciado = false;
    this.simuladoFinalizado = true;
  }

  gerarGrafico(acertos: number, erros: number, qtdQuestoes: number) {
    this.acertos = acertos;
    this.totalQuestoes = qtdQuestoes;

    if (this.totalQuestoes > 0) {
      this.porcentagemAcertos = Math.round((this.acertos / this.totalQuestoes) * 100);
    } else {
      this.porcentagemAcertos = 0;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('graficoResultados', {
      type: 'doughnut',
      data: {
        labels: ['Acertos', 'Erros'],
        datasets: [
          {
            data: [acertos, erros],
            backgroundColor: [
              'rgba(46, 204, 113, 1)',
              'rgba(231, 76, 60, 1)'],
            borderColor: '#2c3e50',
            borderWidth: 2
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true
          },
          doughnut: {
            cutout: '75%'
          }
        },
      },
    });
  }

  obterDados() {
    return { exemplo: 'valor' };
  }

  onOptionChange(alternativaTexto: string) {
    this.selectedOption = alternativaTexto;
    if (this.questaoAtual) {
      this.respostas[this.paginaAtual] = alternativaTexto;
    }
  }

  getLetraAlternativa(alternativaTexto: string): string {
    if (this.questaoAtual) {
      const index = this.questaoAtual.alternativas.findIndex(
        (alt) => alt.texto === alternativaTexto
      );
      return String.fromCharCode(65 + index);
    }
    return '';
  }

  async obterPerfilUsuario() {
    try {
      const data = await this.authService.obterUsuarioAutenticadoDoBackend().toPromise();

      if (data?.id) {
        this.usuario = data;
        this.usuarioId = this.idAlunoMentorado ? Number(this.idAlunoMentorado) : Number(this.usuario.id);
        console.log('Perfil do usuário:', this.usuarioId);
      } else {
        console.error('Erro: ID do usuário não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
    }
  }

  responderQuestao(questao: Questao | null): void {
    if (this.selectedOption) {
      this.questaoRespondida = true;
      this.mensagemDeAviso = `Você marcou a letra ${this.getLetraAlternativa(
        this.selectedOption
      )} como resposta, continue seus estudos e vá para a próxima questão 😃.`;
      this.respostas[this.paginaAtual] = this.selectedOption;
    } else {
      this.mensagemDeAviso =
        'Por favor, selecione uma alternativa antes de responder.';
    }

    if (!questao) {
      console.error('Questão atual é nula.');
      this.resposta = 'Nenhuma questão selecionada.';
      return;
    }

    const respostaDTO: RespostaDTO = {
      questaoId: questao.id,
      selecionarOpcao: this.selectedOption,
      simuladoId: this.simuladoIdRespondendo
    };

    this.questoesService
      .checkAnswer(questao.id, this.usuarioId, respostaDTO)
      .subscribe(
        (resposta: Resposta) => {
          if (resposta.correct) {
            this.isRespostaCorreta = resposta.correct;
            this.respostaCorreta = this.selectedOption;
            this.respostaErrada = '';
            this.resposta = 'Resposta correta!';
          } else {
            this.respostaErrada = this.selectedOption;
            this.respostaCorreta = resposta.opcaoCorreta;
            this.resposta = 'Resposta incorreta. Tente novamente.';
          }

          // Adicionar a resposta à lista de respostas do simulado
          this.respostasList.push({
            questaoId: questao.id,
            temaQuestao: questao.tema,
            subtemaQuestao: questao.subtema,
            selecionarOpcao: this.selectedOption,
            simuladoId: respostaDTO.simuladoId,
            correta: resposta.correct,
          });

          console.log('Respostas do simulado:', this.respostasList);

        },
        (error) => {
          console.error('Erro ao verificar resposta:', error);
          this.resposta =
            'Ocorreu um erro ao verificar a resposta. Por favor, tente novamente mais tarde.';
        }
      );
  }

  isAdmin(): boolean {
    return this.usuarioLogado?.permissao === 'ROLE_ADMIN';
  }

  isProf(): boolean {
    return this.usuarioLogado?.permissao === 'ROLE_PROFESSOR';
  }

  exibirGabarito() {
    this.mostrarGabarito = !this.mostrarGabarito;
  }

  getDescricaoTipoDeProva(tipoDeProva: TipoDeProva): string {
    return getDescricaoTipoDeProva(tipoDeProva);
  }

  getDescricaoAno(ano: Ano): string {
    return getDescricaoAno(ano);
  }

  getDescricaoDificuldade(dificuldade: Dificuldade): string {
    return getDescricaoDificuldade(dificuldade);
  }

  getDescricaoSubtema(subtema: Subtema): string {
    return getDescricaoSubtema(subtema);
  }

  getDescricaoTema(tema: Tema): string {
    return getDescricaoTema(tema);
  }

  getDescricaoQuantidadeDeQuestoesSelecionadas(
    quantidadeDeQuestoesSelecionadas: QuantidadeDeQuestoesSelecionadas
  ): string {
    return getDescricaoQuantidadeDeQuestoesSelecionadas(
      quantidadeDeQuestoesSelecionadas
    );
  }

  getDescricaoRespostasSimulado(respostasSimulado: RespostasSimulado): string {
    return getDescricaoRespostasSimulado(respostasSimulado);
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

  private isTema(value: string): boolean {
    return Object.values(Tema).includes(value as Tema);
  }

  private isSubtema(value: string): boolean {
    return Object.values(Subtema).includes(value as Subtema);
  }

  LimparFiltro() {
    this.multiSelectedAno = [];
    this.multiSelectedDificuldade = [];
    this.multiSelectedTipoDeProva = [];
    this.multiSelectedSubtema = [];
    this.multiSelectedTema = [];
    this.selectedQuantidadeDeQuestoesSelecionadas = null;
    this.multiSelectTemasSubtemasSelecionados = [];
    this.palavraChave = '';
    this.filtrosBloqueados = false;
    this.filtros = {
      ano: null,
      dificuldade: null,
      tipoDeProva: null,
      subtema: null,
      tema: null,
      palavraChave: null,
    };
    this.paginaAtual = 0;
  }

  filtrarQuestoes(): void {
    this.carregando = true;
    const filtros: any = {};

    if (this.multiSelectedAno.length) {
      const anosSelecionados = this.multiSelectedAno
        .map((ano) => this.obterAnoEnum(ano))
        .filter((enumAno) => enumAno !== undefined);

      if (anosSelecionados.length > 0) {
        filtros.ano = anosSelecionados;
      }
    }

    if (this.multiSelectedDificuldade.length) {
      const dificuldadeSelecionadas = this.multiSelectedDificuldade
        .map((dificuldade) => this.obterDificuldadeEnum(dificuldade))
        .filter((enumDificuldade) => enumDificuldade !== undefined);

      if (dificuldadeSelecionadas.length > 0) {
        filtros.dificuldade = dificuldadeSelecionadas;
      }
    }

    if (this.multiSelectedTipoDeProva.length) {
      const tipoDeProvaSelecionado = this.multiSelectedTipoDeProva
        .map((tipoDeProva) => this.obterTipoDeProvaEnum(tipoDeProva))
        .filter((enumTipoDeProva) => enumTipoDeProva !== undefined);

      if (tipoDeProvaSelecionado.length > 0) {
        filtros.tipodeprova = tipoDeProvaSelecionado;
      }
    }

    if (this.selectedRespostasSimulado) {
      const respostaSimuladoSelecionado = this.respostasSimulado.find(
        (respostaSimulado) =>
          this.getDescricaoRespostasSimulado(respostaSimulado) ===
          this.selectedRespostasSimulado
      );
      if (respostaSimuladoSelecionado) {
        filtros.questaoRespondida = respostaSimuladoSelecionado;
      }
    }

    if (this.multiSelectedSubtema.length) {
      const subtemaSelecionado = this.multiSelectedSubtema
        .map((subtema) => this.obterSubtemaEnum(subtema))
        .filter((enumSubtema) => enumSubtema !== undefined);

      if (subtemaSelecionado.length > 0) {
        filtros.subtema = subtemaSelecionado;
      }
    }

    if (this.multiSelectedAno.length) {
      const temaSelecionado = this.multiSelectedAno
        .map((tema) => this.obterTemaEnum(tema))
        .filter((enumTema) => enumTema !== undefined);

      if (temaSelecionado.length > 0) {
        filtros.tema = temaSelecionado;
      }
    }
    if (this.quantidadeDeQuestoesSelecionadas) {
      const quantidadeSelecionada = this.quantidadeDeQuestoesSelecionadas.find(
        (quantidadeDeQuestoesSelecionadas) =>
          getDescricaoQuantidadeDeQuestoesSelecionadas(
            quantidadeDeQuestoesSelecionadas
          ) === this.selectedQuantidadeDeQuestoesSelecionadas
      );
      if (quantidadeSelecionada) {
        filtros.quantidadeDeQuestoesSelecionadas = quantidadeSelecionada;
      }
    }

    if (this.multiSelectTemasSubtemasSelecionados.length) {
      const temasSelecionados: string[] = [];
      const subtemasSelecionados: string[] = [];

      for (const item of this.multiSelectTemasSubtemasSelecionados) {
        if (typeof item === 'string') {
          if (this.isTema(item)) {
            // console.log("É um tema:", item);
            temasSelecionados.push(item);
          } else if (this.isSubtema(item)) {
            // console.log("É um subtema:", item);
            subtemasSelecionados.push(item);
          } else {
            console.warn("Valor não reconhecido como tema nem subtema:", item);
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

    // Verificar se a palavra-chave está preenchida
    if (this.palavraChave && this.palavraChave.trim() !== '') {
      filtros.palavraChave = this.palavraChave.trim();
    } else {
      console.error(
        'Quantidade de questões selecionada é inválida:',
        this.quantidadeDeQuestoesSelecionadas
      );
    }

    if (Object.keys(filtros).length === 0) {
      this.message = 'Por favor, selecione pelo menos um filtro.';
      this.questoes = [];
      this.idsQuestoes = [];
      return;
    }


    this.questoesService
      .filtrarSimulados(this.usuarioId, filtros, 0, 100)
      .subscribe(
        (questoes: Questao[]) => {
          if (questoes.length === 0) {
            if (
              filtros.ano &&
              !filtros.tipoDeProva &&
              !filtros.dificuldade &&
              !filtros.subtema &&
              !filtros.tema &&
              !filtros.palavraChave &&
              !filtros.qtdQuestoes
            ) {
              this.message =
                'Nenhuma questão encontrada para o ano selecionado.';
            } else if (
              filtros.tipoDeProva &&
              !filtros.ano &&
              !filtros.dificuldade &&
              !filtros.subtema &&
              !filtros.tema &&
              !filtros.palavraChave &&
              !filtros.qtdQuestoes
            ) {
              this.message =
                'Nenhuma questão encontrada para o tipo de prova selecionado.';
            } else if (
              filtros.dificuldade &&
              !filtros.ano &&
              !filtros.tipoDeProva &&
              !filtros.subtema &&
              !filtros.tema &&
              !filtros.palavraChave &&
              !filtros.qtdQuestoes
            ) {
              this.message =
                'Nenhuma questão encontrada para a dificuldade selecionada.';
            } else if (
              filtros.subtema &&
              !filtros.ano &&
              !filtros.tipoDeProva &&
              !filtros.dificuldade &&
              !filtros.tema &&
              !filtros.palavraChave &&
              !filtros.qtdQuestoes
            ) {
              this.message =
                'Nenhuma questão encontrada para o subtema selecionado.';
            } else if (
              filtros.tema &&
              !filtros.ano &&
              !filtros.tipoDeProva &&
              !filtros.dificuldade &&
              !filtros.subtema &&
              !filtros.palavraChave &&
              !filtros.qtdQuestoes
            ) {
              this.message =
                'Nenhuma questão encontrada para o tema selecionado.';
            } else if (
              filtros.palavraChave &&
              !filtros.ano &&
              !filtros.tipoDeProva &&
              !filtros.dificuldade &&
              !filtros.subtema &&
              !filtros.tema &&
              !filtros.qtdQuestoes
            ) {
              this.message =
                'Nenhuma questão encontrada para a palavra-chave informada.';
            } else if (
              filtros.qtdQuestoes &&
              !filtros.ano &&
              !filtros.tipoDeProva &&
              !filtros.dificuldade &&
              !filtros.subtema &&
              !filtros.tema &&
              !filtros.palavraChave
            ) {
              this.message =
                'Nenhuma questão encontrada para a quantidade de questões selecionada.';
            } else {
              this.message =
                'Nenhuma questão encontrada para os filtros selecionados.';
            }
            this.questoes = [];
            this.idsQuestoes = [];
            this.questaoAtual = null;
          } else {
            this.message = '';
            this.questoes = questoes;
            this.idsQuestoes = questoes.map((q) => q.id);
            this.paginaAtual = 0;
            this.questaoAtual = this.questoes[this.paginaAtual];

            this.atualizarQuestaoAtual();
          }
          this.resposta = '';
          this.mostrarGabarito = false;
          this.toggleFiltros();
          this.carregando = false;
        },
        (error) => {
          console.error('Erro ao filtrar questões:', error);
          this.message =
            'Ocorreu um erro ao filtrar questões. Por favor, tente novamente mais tarde.';
          this.idsQuestoes = [];
          this.carregando = false;
        }
      );
  }

  carregarRespostasPreviamente(): Observable<void> {
    if (!this.questoes || this.questoes.length === 0) {
      return of(void 0);
    }

    this.respostas = [];
    this.respostasList = [];

    const observables = this.questoes.map((questao, index) => {
      return this.questoesService.questaoRespondida(this.usuarioId, questao.id, this.simuladoIdInicial).pipe(
        tap(resposta => {
          if (resposta) {
            this.respostas[index] = resposta.opcaoSelecionada;

            this.respostasList.push({
              questaoId: questao.id,
              temaQuestao: questao.tema,
              selecionarOpcao: resposta.opcaoSelecionada,
              correta: resposta.correct,
            });
          }
        }),
        catchError(erro => {
          console.error(`Erro ao carregar resposta para a questão ${questao.id}:`, erro);
          return of(null);
        })
      );
    });

    return forkJoin(observables).pipe(
      map(() => void 0)
    );
  }

  carregarRespostaAnterior() {
    const respostaAnterior = this.respostas[this.paginaAtual];
    console.log(this.paginaAtual);
    if (respostaAnterior) {
      this.selectedOption = respostaAnterior;
      if (this.isMeuSimulado) {
        this.respostaQuestao(this.questoes[this.paginaAtual].id, this.simuladoIdInicial);
      }
    } else {
      this.selectedOption = '';
    }
  }

  private atualizarQuestaoAtual(): void {
    if (this.questaoAtual) {
      this.questoesStateService.setQuestaoAtual(this.questaoAtual);
    }
  }

  anteriorQuestao() {
    this.mensagemDeAviso = '';
    if (this.paginaAtual > 0) {
      this.numQuestaoAtual--;
      this.paginaAtual--;
      this.questaoAtual = this.questoes[this.paginaAtual];
      this.mostrarGabarito = false;
      this.respostaCorreta = '';
      this.respostaErrada = '';
      this.respostaVerificada = false;
      this.carregarRespostaAnterior(); // Chame a função para carregar a resposta anterior

      this.atualizarQuestaoAtual();
    }
  }

  proximaQuestao() {
    if (!this.questaoRespondida && !this.revisandoSimulado && this.tempoRestanteQuestaoSimulado > 0) {
      this.mensagemDeAviso = 'Questão não respondida. Por favor, responda antes de avançar.';
      return;
    }

    if (this.paginaAtual < this.questoes.length - 1) {
      this.numQuestaoAtual++;
      this.paginaAtual++;
      this.tempoRestanteQuestaoSimulado = 160;
      this.questaoAtual = this.questoes[this.paginaAtual];
      this.mostrarGabarito = false;
      this.resposta = '';
      this.selectedOption = '';
      this.mensagemDeAviso = ''; // Limpa a mensagem ao clicar em "próxima"
      this.respostaCorreta = '';
      this.respostaErrada = '';
      this.respostaVerificada = false;
      this.radioDisabled = false;
      this.questaoRespondida = false;

      clearInterval(this.intervalContagemRegressiva);
      this.contagemRegressivaSimuladoQuestao();

      this.atualizarQuestaoAtual();

      if (this.isMeuSimulado) {
        this.respostaQuestao(this.questoes[this.paginaAtual].id, this.simuladoIdInicial);
      }
    } else {
      this.mensagemDeAviso = 'Parabéns! Você chegou à última questão do simulado. Responda e finalize para ver seu resultado!';
    }
  }

  confirmarSalvarSimulado(
    nomeSimulado: string,
    descricaoSimulado: string
  ): void {
    const qtdQuestoesValue = this.selectedQuantidadeDeQuestoesSelecionadas;

    // Montando o objeto simulado
    const simulado: any = {
      nomeSimulado: nomeSimulado,
      assunto: descricaoSimulado,
      qtdQuestoes: qtdQuestoesValue,
      ano: this.mapearDescricoesParaEnums(this.multiSelectedAno, AnoDescricoes),
      tema: this.mapearDescricoesParaEnums(
        this.multiSelectedTema,
        TemaDescricoes
      ),
      dificuldade: this.mapearDescricoesParaEnums(
        this.multiSelectedDificuldade,
        DificuldadeDescricoes
      ),
      tipoDeProva: this.mapearDescricoesParaEnums(
        this.multiSelectedTipoDeProva,
        TipoDeProvaDescricoes
      ),
      subtema: this.mapearDescricoesParaEnums(
        this.multiSelectedSubtema,
        SubtemaDescricoes
      ),
      questaoIds: this.idsQuestoes,
      respostasSimulado: this.selectedRespostasSimulado,
      criadoPor: this.usuario.nome,
    };

    if (
      !simulado.nomeSimulado ||
      !simulado.assunto ||
      simulado.qtdQuestoes == null
    ) {
      this.exibirMensagem(
        'Preencha todos os campos obrigatórios: Nome, Assunto e Quantidade de Questões.',
        'erro'
      );
      return;
    }

    const idUsuario = localStorage.getItem('usuarioIdSimulado') !== null
      ? Number(localStorage.getItem('usuarioIdSimulado'))
      : this.usuarioId;

    console.log(simulado);

    this.simuladoService.cadastrarSimulado(idUsuario, simulado).subscribe(
      (response) => {
        this.exibirMensagem(
          'Seu simulado foi cadastrado com sucesso!',
          'sucesso'
        );


        this.totalQuestoes = this.idsQuestoes.length;

        this.simuladoIdRespondendo = response.id;

        const modalElement = document.getElementById('confirmacaoModal');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance?.hide();
          this.contagemRegressivaSimuladoQuestao();
          this.iniciarSimulado();
        }
      },
      (error) => {
        const errorMessage =
          error?.error?.message ??
          'Erro ao cadastrar o simulado. Tente novamente.';
        this.exibirMensagem(errorMessage, 'erro');
      }
    );
  }

  private carregarFiltrosEDescricoes() {
    this.tiposDeProvaDescricoes = this.tiposDeProva
      .filter((tipoProvaKey) => {
        if (tipoProvaKey == TipoDeProva.SBRV) {
          return this.isProf() || this.isAdmin();
        }
        return true;
      })

      .map(this.getDescricaoTipoDeProva);
    this.anosDescricoes = this.anos.map(this.getDescricaoAno);
    this.dificuldadesDescricoes = this.dificuldades.map(this.getDescricaoDificuldade);
    this.subtemasDescricoes = this.subtemas.map(this.getDescricaoSubtema);
    this.temasDescricoes = this.temas.map(this.getDescricaoTema);
    this.quantidadeDeQuestoesSelecionadasDescricoes =
      this.quantidadeDeQuestoesSelecionadas.map(this.getDescricaoQuantidadeDeQuestoesSelecionadas);
    this.respostasSimuladoDescricao = this.respostasSimulado.map(this.getDescricaoRespostasSimulado);

    this.subtemasAgrupadosPorTema = Object.entries(temasESubtemas).map(([temaKey, subtemas]) => {
      const temaEnum = temaKey as Tema;
      return {
        label: this.getDescricaoTema(temaEnum),
        value: temaEnum,
        options: subtemas.map(subtema => ({
          label: this.getDescricaoSubtema(subtema),
          value: subtema
        }))
      };
    });
  }

  private mapearDescricoesParaEnums(
    selecoes: string[],
    descricoesEnum: any
  ): string[] {
    if (!selecoes || selecoes.length === 0) return [];
    return selecoes
      .map((descricao) =>
        Object.keys(descricoesEnum).find(
          (key) => descricoesEnum[key] === descricao
        )
      )
      .filter((enumValue) => enumValue !== undefined) as string[];
  }

  mensagem: { texto: string; tipo: string } | null = null;

  exibirMensagem(texto: string, tipo: 'sucesso' | 'erro'): void {
    this.mensagem = { texto, tipo };
    setTimeout(() => {
      this.mensagem = null;
    }, 5000);
  }

  abrirModal(): void {
    const modalElement = document.getElementById('confirmacaoModal');
    const modala = document.getElementById('confirmacaoModal');
    if (modala) {
      modala.style.display = 'block';
    }
    const modal = new bootstrap.Modal(modalElement!);
    modal.show();

    modalElement?.addEventListener('hidden.bs.modal', () => {
      this.fecharCardConfirmacao();

    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.isSimuladoIniciado && !this.simuladoFinalizado) {
      this.finalizarSimulado();
      $event.returnValue = true;
    }
  }

  cancelarSimulado(): void {
    window.location.reload();
  }

  fecharAlerta() {
    this.alertaVisivel = false;
  }

  fecharCardConfirmacao(): void {
    this.mostrarCardConfirmacao = false;
  }

  iniciarSimulado(tempoInicial: number = 0): void {

    this.tempo = tempoInicial;
    this.simuladoService.simuladoIniciado();

    if (!this.intervalId) {
      this.isSimuladoIniciado = true;
      this.realizandoSimulado = true;

      this.intervalId = setInterval(() => {
        this.tempo++;
      }, 1000);
    }

    // Essas flags controlam a exibição no HTML
    this.simuladoIniciado = true;
    this.simuladoFinalizado = false;
  }

  contagemRegressivaSimuladoQuestao(): void {
    if (this.tempoRestanteQuestaoSimulado > 0) {
      this.intervalContagemRegressiva = setInterval(() => {
        if (this.tempoRestanteQuestaoSimulado <= 0) {
          this.tempoRestanteQuestaoSimulado = 0;
          this.radioDisabled = true;
          // clearInterval(this.intervalContagemRegressiva); 
        } else {
          this.tempoRestanteQuestaoSimulado--;
        }

      }, 1000);
    }
  }

  getCorTempoRestante(): string {
    return this.tempoRestanteQuestaoSimulado < 30 ? 'red' : "";
  }

  visualizarSimulado(): void {
    if (!this.isSimuladoIniciado) {
      this.isSimuladoIniciado = true;
      this.tempo = 0;
    }
    this.simuladoIniciado = true;
    this.simuladoFinalizado = false;
    this.revisandoSimulado = true;
  }

  // Função para formatar o tempo decorrido (opcional)
  formatarTempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${this.formatarNumero(horas)}:${this.formatarNumero(
      minutos
    )}:${this.formatarNumero(segs)}`;
  }

  // Função auxiliar para formatar com dois dígitos
  formatarNumero(numero: number): string {
    return numero < 10 ? `0${numero}` : `${numero}`;
  }

  revisarSimulado(id: number | null) {

    if (id === null || Number.isNaN(id)) {
      return;
    }

    this.simuladoService.obterSimuladoPorId(id).subscribe(
      (data) => {
        // console.log('Simulado:', data);
        this.router.navigate(['/usuario/simulados'], { state: { simulado: data } });
      },
      (error) => {
        alert('Erro ao obter simulado por ID');
        console.error('Erro ao obter simulado por ID:', error);
      }
    )
    this.router.navigate(['usuario/dashboard']);
  }

  isImage(url: string | null): boolean {
    return typeof url === 'string' && /\.(jpeg|jpg|png|gif)$/i.test(url);
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

  respostaQuestao(questaoAtual: number, simuladoAtual: number) {
    this.questoesService
      .questaoRespondida(this.usuarioId, questaoAtual, simuladoAtual)
      .subscribe({
        next: (resposta) => {
          if (resposta) {
            this.verificarRespostaUsuario(resposta);
            console.log(resposta);
          }
        },
        error: (erro) => {
          console.error('Erro ao verificar a resposta:', erro);
        },
      });
  }

  verificarRespostaUsuario(resposta: Resposta) {
    this.selectedOption = resposta.opcaoSelecionada; // Alternativa escolhida
    this.isRespostaCorreta = resposta.correct; // Se está correta ou não

    if (resposta.correct) {
      this.respostaCorreta = this.selectedOption;
      this.respostaErrada = '';
    } else {
      this.respostaErrada = this.selectedOption;
      this.respostaCorreta = resposta.opcaoCorreta; // Alternativa correta
    }
    this.respostaVerificada = true; // Marca como verificada

  }


  verificarBloqueioFiltros(): void {
    const tiposEspeciais = ['AAO', 'ICO/FRCOphto'];
    this.filtrosBloqueados = this.multiSelectedTipoDeProva.some(tipo => tiposEspeciais.includes(tipo));
    if (this.filtrosBloqueados) {
      this.multiSelectedAno = [];
    }
  }

  onTipoDeProvaChange(): void {
    this.verificarBloqueioFiltros();
  }

  isFiltroBloqueado(): boolean {
    return this.filtrosBloqueados;
  }

  fecharPopup(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}