import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
import { QuantidadeDeQuestoesSelecionadas } from '../page-questoes/enums/quant-questoes';
import { RespostasSimulado } from '../page-questoes/enums/resp-simu';
import Chart from 'chart.js';
import { Router } from '@angular/router';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from '@angular/platform-browser';

declare var bootstrap: any;

@Component({
  selector: 'app-page-simulado',
  templateUrl: './page-simulado.component.html',
  styleUrls: ['./page-simulado.component.css'],
})
export class PageSimuladoComponent implements OnInit {
  carregando: boolean = false;
  nomeSimulado: string = '';
  descricaoSimulado: string = '';

  mensagemDeAviso!: string;

  tempo: number = 0; // Contador de tempo em segundos
  intervalId: any; // Armazena o ID do intervalo para controlar o timer
  isSimuladoIniciado: boolean = false; // Controla se o simulado foi iniciado ou não

  questao: Questao = new Questao();
  idsQuestoes: number[] = [];
  selectedOption: string = '';

  usuario!: Usuario;
  usuarioId!: number;

  @ViewChild('confirmacaoModalRef', { static: false })
  confirmacaoModal!: ElementRef;

  nomeFiltro: string = '';
  descricaoFiltro: string = '';

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

  questoes: Questao[] = [];
  isFiltered = false;
  p: number = 1;
  mensagemSucesso: string = '';

  isRespostaCorreta: boolean = false;
  respostaCorreta: string = '';
  respostaErrada: string = '';
  respostaVerificada: boolean = false;
  jaRespondeu: boolean = false;
  visualizando: boolean = false;

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

  mostrarFiltros: boolean = false;

  isMeuSimulado: boolean = false;

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService,
    private simuladoService: SimuladoService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    const meuSimulado = history.state.simulado;
    this.simuladoIdInicial = meuSimulado?.id;
    this.dados = this.obterDados();
    await this.obterPerfilUsuario();
    if (meuSimulado) {
      this.toggleFiltros();
      this.visualizando = true;
      this.jaRespondeu = true;
      this.isMeuSimulado = true;
      this.multiSelectedAno = meuSimulado.ano;
      this.multiSelectedTipoDeProva = meuSimulado.tipoDeProva;
      this.multiSelectedTema = meuSimulado.tema;
      this.multiSelectedSubtema = meuSimulado.subtema;
      this.multiSelectedDificuldade = meuSimulado.dificuldade;
      this.selectedQuantidadeDeQuestoesSelecionadas = meuSimulado.qtdQuestoes;
      this.selectedRespostasSimulado = meuSimulado.respostasSimulado;
      this.questoes = meuSimulado.questoes;
      if (this.questoes) {
        this.idsQuestoes = this.questoes.map((q) => q.id);
        this.paginaAtual = 0;
        this.questaoAtual = this.questoes[this.paginaAtual];
        this.resposta = '';
        this.carregarRespostasPreviamente();
        this.respostaQuestao(this.questoes[this.paginaAtual].id, this.simuladoIdInicial);
        this.visualizarSimulado();
      }
    }
    this.tiposDeProvaDescricoes = this.tiposDeProva.map((tipoDeProva) =>
      this.getDescricaoTipoDeProva(tipoDeProva)
    );
    this.anosDescricoes = this.anos.map((ano) => this.getDescricaoAno(ano));
    this.dificuldadesDescricoes = this.dificuldades.map((dificuldade) =>
      this.getDescricaoDificuldade(dificuldade)
    );
    this.subtemasDescricoes = this.subtemas.map((subtema) =>
      this.getDescricaoSubtema(subtema)
    );
    this.temasDescricoes = this.temas.map((tema) =>
      this.getDescricaoTema(tema)
    );
    this.quantidadeDeQuestoesSelecionadasDescricoes =
      this.quantidadeDeQuestoesSelecionadas.map(
        (quantidadeDeQuestoesSelecionadas) =>
          this.getDescricaoQuantidadeDeQuestoesSelecionadas(
            quantidadeDeQuestoesSelecionadas
          )
      );

    this.respostasSimuladoDescricao = this.respostasSimulado.map(
      (respostasSimulado) =>
        this.getDescricaoRespostasSimulado(respostasSimulado)
    );
  }

  finalizarSimulado() {
    this.simuladoService
      .finalizarSimulado(this.usuarioId, this.respostasList)
      .subscribe((resultado) => {
        this.gerarGrafico(resultado.acertos, resultado.erros);
      });
    this.simuladoIniciado = false;
    this.simuladoFinalizado = true;
    this.tempoTotal = this.tempo; // Tempo total em segundos
  }

  gerarGrafico(acertos: number, erros: number) {
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart('graficoBarras', {
      type: 'pie',
      data: {
        labels: ['Acertos', 'Erros'],
        datasets: [
          {
            label: 'Quantidade',
            data: [acertos, erros],
            backgroundColor: ['#4CAF50', '#F44336'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });
  }

  obterDados() {
    // Simula a obtenção de dados
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
        this.usuarioId = parseInt(this.usuario.id, 10);
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
      this.mensagemDeAviso = `Você marcou a letra ${this.getLetraAlternativa(
        this.selectedOption
      )} como resposta, continue seus estudos e vá para a próxima questão 😃.`;
      // Armazena a resposta para a questão atual
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
            selecionarOpcao: this.selectedOption,
            correta: resposta.correct,
          });
        },
        (error) => {
          console.error('Erro ao verificar resposta:', error);
          this.resposta =
            'Ocorreu um erro ao verificar a resposta. Por favor, tente novamente mais tarde.';
        }
      );
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

  LimparFiltro() {
    this.multiSelectedAno = [];
    this.multiSelectedDificuldade = [];
    this.multiSelectedTipoDeProva = [];
    this.multiSelectedSubtema = [];
    this.multiSelectedTema = [];
    this.selectedQuantidadeDeQuestoesSelecionadas = null;
    this.palavraChave = '';
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

  carregarRespostasPreviamente(): void {
    this.questoes.forEach((questao, index) => {
      this.questoesService.questaoRespondida(this.usuarioId, questao.id, this.simuladoIdInicial).subscribe({
        next: (resposta) => {
          if (resposta) {
            this.respostas[index] = resposta.opcaoSelecionada;
            if (index === this.paginaAtual) {
              this.selectedOption = resposta.opcaoSelecionada;
              this.verificarRespostaUsuario(resposta);
            }
          }
        },
        error: (erro) => {
          console.error(`Erro ao carregar resposta para a questão ${questao.id}:`, erro);
        }
      });
    });
  }

  carregarRespostaAnterior() {
    const respostaAnterior = this.respostas[this.paginaAtual];
    console.log(this.paginaAtual);
    if (respostaAnterior) {
      this.selectedOption = respostaAnterior;
      if(this.isMeuSimulado){
        this.respostaQuestao(this.questoes[this.paginaAtual].id, this.simuladoIdInicial);
      }
    } else {
      this.selectedOption = '';
    }
  }

  anteriorQuestao() {
    this.mensagemDeAviso = '';
    if (this.paginaAtual > 0) {
      this.paginaAtual--;
      this.questaoAtual = this.questoes[this.paginaAtual];
      this.mostrarGabarito = false;
      this.respostaCorreta = '';
      this.respostaErrada = '';
      this.respostaVerificada = false;
      this.carregarRespostaAnterior(); // Chame a função para carregar a resposta anterior
    }
  }

  proximaQuestao() {
    if (this.paginaAtual < this.questoes.length - 1) {
      this.paginaAtual++;
      this.questaoAtual = this.questoes[this.paginaAtual];
      this.mostrarGabarito = false;
      this.resposta = '';
      this.selectedOption = '';
      this.mensagemDeAviso = ''; // Limpa a mensagem ao clicar em "próxima"
      this.respostaCorreta = '';
      this.respostaErrada = '';
      this.respostaVerificada = false;
      if(this.isMeuSimulado){
        this.respostaQuestao(this.questoes[this.paginaAtual].id, this.simuladoIdInicial);
      }
    }
  }

  confirmarSalvarSimulado(
    nomeSimulado: string,
    descricaoSimulado: string
  ): void {
    const qtdQuestoesValue = this.selectedQuantidadeDeQuestoesSelecionadas;

    // Montando o objeto simulado
    const simulado: any = {
      nomeSimulado,
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
    };

    // Validação básica
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

    // Chamada ao serviço
    this.simuladoService.cadastrarSimulado(this.usuarioId, simulado).subscribe(
      (response) => {
        this.exibirMensagem(
          'Seu simulado foi cadastrado com sucesso!',
          'sucesso'
        );
        
        this.simuladoIdRespondendo = response.id;

        // Fechar modal automaticamente (usando Bootstrap ou outro método)
        const modalElement = document.getElementById('confirmacaoModal');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance?.hide();
        }
      },
      (error) => {
        const errorMessage =
          error?.error?.message ||
          'Erro ao cadastrar o simulado. Tente novamente.';
        this.exibirMensagem(errorMessage, 'erro');
      }
    );
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
    }, 5000); // Mensagem desaparece após 5 segundos
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

  fecharAlerta() {
    this.alertaVisivel = false;
  }

  fecharCardConfirmacao(): void {
    this.mostrarCardConfirmacao = false;
  }

  iniciarSimulado(): void {
    this.abrirModal();
    if (!this.isSimuladoIniciado) {
      this.isSimuladoIniciado = true;
      this.tempo = 0;
      this.intervalId = setInterval(() => {
        this.tempo++;
      }, 1000); // Atualiza o tempo a cada segundo
    }
    this.simuladoIniciado = true;
    this.simuladoFinalizado = false;
  }

  visualizarSimulado(): void {
    if (!this.isSimuladoIniciado) {
      this.isSimuladoIniciado = true;
      this.tempo = 0;
    }
    this.simuladoIniciado = true;
    this.simuladoFinalizado = false;
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

  backHome() {
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
}
