import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, PipeTransform } from '@angular/core';
import { TipoDeProva } from './enums/tipoDeProva';
import {
  getDescricaoAno,
  getDescricaoDificuldade,
  getDescricaoSubtema,
  getDescricaoTema,
  getDescricaoTipoDeProva,
} from './enums/enum-utils';
import { Ano } from './enums/ano';
import { Dificuldade } from './enums/dificuldade';
import { Subtema } from './enums/subtema';
import { Tema } from './enums/tema';
import { Questao } from './questao';
import { QuestoesService } from 'src/app/services/questoes.service';
import { FiltroService } from 'src/app/services/filtro.service';
import { RespostaDTO } from '../RespostaDTO'; // Adicione esta importação
import { Resposta } from '../Resposta'; // Adicione esta importação
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/login/usuario';
import { FiltroDTO } from '../filtroDTO';

import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { AnoDescricoes } from './enums/ano-descricoes';
import { DificuldadeDescricoes } from './enums/dificuldade-descricao';
import { TipoDeProvaDescricoes } from './enums/tipodeprova-descricao';
import { SubtemaDescricoes } from './enums/subtema-descricao';
import { TemaDescricoes } from './enums/tema-descricao';

declare var bootstrap: any;

@Component({
  selector: 'app-page-questoes',
  templateUrl: './page-questoes.component.html',
  styleUrls: ['./page-questoes.component.css'],
})
export class PageQuestoesComponent implements OnInit, AfterViewChecked {

  filtroSelecionado: any;
  questao: Questao = new Questao();
  selectedOption: string = '';
  usuario!: Usuario;
  usuarioId!: number;
  mensagemErro: string | null = null;

  tiposDeProva = Object.values(TipoDeProva);
  anos = Object.values(Ano);
  dificuldades = Object.values(Dificuldade);
  subtemas = Object.values(Subtema);
  temas = Object.values(Tema);
  mensagemSucesso: string = '';

  jaRespondeu: boolean = false;
  respondendo: boolean = false;

  fotoPreviews: { [key: string]: string } = {};


  respostaVerificada: boolean = false;
  respostaFoiSubmetida: boolean = false;
  respostaCorreta: string | null = null;
  respostaErrada: string | null = null;
  isRespostaCorreta: boolean = false;

  message: string = '';
  resposta: string = ''; // Adiciona esta variável para armazenar a resposta

  questaoAtual: Questao | null = null;
  paginaAtual: number = 0;
  filtros: any = {
    ano: null,
    dificuldade: null,
    tipoDeProva: null,
    subtema: null,
    tema: null,
    palavraChave: null,
  };

  mostrarCardConfirmacao = false;
  filtroASalvar!: FiltroDTO;

  mostrarGabarito: boolean = false; 
  @ViewChild('confirmacaoModalRef', { static: false })
  confirmacaoModal!: ElementRef;

  questoes: Questao[] = [];
  isFiltered = false;
  p: number = 1;

  questaoDTO = new Questao();
  selectedAlternativeIndex: number = -3;

  tiposDeProvaDescricoes: string[] = [];
  anosDescricoes: string[] = [];
  dificuldadesDescricoes: string[] = [];
  subtemasDescricoes: string[] = [];
  temasDescricoes: string[] = [];

  descricaoFiltro: string = '';
  palavraChave: string = '';
  multSelectAno: Ano[] = [];
  multSelecDificuldade: Dificuldade[] = [];
  multSelectTipoDeProva: TipoDeProva[] = [];
  multSelectSubtema: Subtema[] = [];
  multSelectTema: Tema[] = [];

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

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
     
  ) {}

  ngOnInit(): void {
    this.obterPerfilUsuario();
    this.loadQuestao();
    const meuFiltro = history.state.questao;
    if(meuFiltro){
      this.multSelectAno = meuFiltro.ano;
      this.multSelectTipoDeProva = meuFiltro.tipoDeProva;
      this.multSelectTema = meuFiltro.tema;
      this.multSelectSubtema = meuFiltro.subtema;
      this.multSelecDificuldade = meuFiltro.dificuldade;
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
    this.loadQuestao();
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
  }

  ngAfterViewChecked(): void {
    this.resizeImages();
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

  obterPerfilUsuario() {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        this.usuario = data; // Armazenar os dados do perfil do usuário na variável 'usuario'
        this.usuarioId = parseInt(this.usuario.id);
      },
      (error) => {
       
      }
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
    this.multSelectAno = [];
    this.multSelecDificuldade = [];
    this.multSelectTipoDeProva = [];
    this.multSelectSubtema = [];
    this.multSelectTema = [];
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


    if (this.multSelecDificuldade.length) {
      const dificuldadeSelecionada = this.multSelecDificuldade
      .map((dificuldade) => this.obterDificuldadeEnum(dificuldade))
      .filter((enumDificuldade) => enumDificuldade!== undefined);

      if (dificuldadeSelecionada) {
        filtros.dificuldade = dificuldadeSelecionada;
      }
    }

    if (this.multSelectTipoDeProva.length) {
      const tipoDeProvaSelecionado = this.multSelectTipoDeProva
      .map((tipoDeProva) => this.obterTipoDeProvaEnum(tipoDeProva))
      .filter((enumTipoDeProva) => enumTipoDeProva!== undefined);

      if (tipoDeProvaSelecionado) {
        filtros.tipoDeProva = tipoDeProvaSelecionado;
      }
    }


    if (this.multSelectSubtema.length) {
      const subtemaSelecionado = this.multSelectSubtema
      .map((subtema) => this.obterSubtemaEnum(subtema))
      .filter((enumSubtema) => enumSubtema!== undefined);

      if (subtemaSelecionado) {
        filtros.subtema = subtemaSelecionado;
      }
    }


    if (this.multSelectTema.length) {
      const temaSelecionado = this.multSelectTema
      .map((tema) => this.obterTemaEnum(tema))
      .filter((enumTema) => enumTema!== undefined);
      
      if (temaSelecionado) {
        filtros.tema = temaSelecionado;
      }
    }

    // Verificar se a palavra-chave está preenchida
    if (this.palavraChave && this.palavraChave.trim() !== '') {
      filtros.palavraChave = this.palavraChave.trim();
    }
  
    if (Object.keys(filtros).length === 0) {
      this.message = 'Por favor, selecione pelo menos um filtro.';
      this.questoes = [];
      return;
    }

  
    this.questoesService.filtrarQuestoes(this.usuarioId, filtros, 0, 100).subscribe(
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
        }
  
        this.resposta = '';
        this.mostrarGabarito = false;
        this.numeroDeQuestoes = questoes.length;
        this.toggleFiltros();

      },
      (error) => {
        console.error('Erro ao filtrar questões:', error);
        this.message = 'Ocorreu um erro ao filtrar questões. Por favor, tente novamente mais tarde.';
      }
    );
  }

  selecionarQuestao(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const index = Number(target.value);
    this.paginaAtual = index;
    this.questaoAtual = this.questoes[this.paginaAtual];
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
  
    // Remover a última vírgula e espaço
    return mensagemUsuarioTratamento.slice(0, -2) + '.';
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
      this.questaoAtual.fotoDaRespostaQuatroUrl
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
    this.jaRespondeu = false;
    this.mensagemErro = ''; // Limpa a mensagem de erro ao voltar para uma questão anterior
  
    if (this.paginaAtual > 0) {
      this.paginaAtual--;
      this.questaoAtual = this.questoes[this.paginaAtual];

      // Resetar variáveis relacionadas à resposta
      this.selectedOption = '';
      this.isRespostaCorreta = false;
      this.mostrarGabarito = false; // O gabarito não é exibido automaticamente
      this.respostaCorreta = '';
      this.respostaErrada = '';
      this.respostaVerificada = false;
  
      this.mostrarPorcentagem = false; // Reseta a barra de progresso
      this.porcentagemAcertos = 0;
    }
  }
  
  
  proximaQuestao() {
    this.jaRespondeu = false;
    this.resposta = '';
    this.mensagemErro = ''; // Limpa qualquer mensagem de erro anterior
  
    if (this.paginaAtual < this.questoes.length - 1) {
      this.paginaAtual++;
      this.questaoAtual = this.questoes[this.paginaAtual];
  
      // Resetar variáveis relacionadas à resposta
      this.selectedOption = '';
      this.isRespostaCorreta = false;
      this.mostrarGabarito = false; // Gabarito só será exibido ao clicar no botão
      this.respostaCorreta = '';
      this.respostaErrada = '';
      this.respostaVerificada = false;
  
      this.mostrarPorcentagem = false; // Reseta a barra de progresso
      this.porcentagemAcertos = 0;
  
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
            selecionarOpcao: this.selectedOption,
          };
  
          const idUser = parseInt(this.usuario.id);
  
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
    return;
  }

  if(!this.filtroASalvar) {
    this.filtroASalvar = {} as FiltroDTO;
  }

  this.filtroASalvar = {
    nome: nomeFiltro,
    assunto: descricaoFiltro,
    ano: this.mapearDescricoesParaEnums(this.multSelectAno, AnoDescricoes),
    dificuldade: this.mapearDescricoesParaEnums(this.multSelecDificuldade, DificuldadeDescricoes),
    tipoDeProva: this.mapearDescricoesParaEnums(this.multSelectTipoDeProva, TipoDeProvaDescricoes),
    subtema: this.mapearDescricoesParaEnums(this.multSelectSubtema, SubtemaDescricoes),
    tema: this.mapearDescricoesParaEnums(this.multSelectTema, TemaDescricoes),
  };
  
  if(this.filtroASalvar) {
    const idUser = parseInt(this.usuario.id);
    
    this.filtroService.salvarFiltro(this.filtroASalvar, idUser).subscribe(
      (response) => {
        this.exibirMensagem('O filtro foi salvo com sucesso!', 'sucesso');

        // Fechar modal automaticamente
        const modalElement = document.getElementById('confirmacaoModal');
        if(modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance?.hide();
        }
      },
      (error) => {
        const errorMessage = error?.error?.message || 'Erro ao salvar o filtro. Por favor, tente novamente.';
        this.exibirMensagem(errorMessage, 'erro');
      }
    )
  }
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
    this.questoesService.getQuestaoById(this.paginaAtual).subscribe(
      (data: Questao) => {
        this.questaoAtual = data;
        // Sanitizar o conteúdo
        this.comentarioDaQuestaoSanitizado =
          this.sanitizer.bypassSecurityTrustHtml(
            this.questaoAtual.comentarioDaQuestao || ''
          );
          this.sanitizerEnunciado = this.applyClassesToEnunciado(this.questaoAtual.enunciadoDaQuestao || '');
      },
      (error) => {
        //console.error('Erro ao carregar cometario:', error);
      }
    );
  }

 

  isImage(url: string): boolean {
    //console.log(`Verificando imagem: ${url}`);
    return url ? url.includes('.jpeg') || url.includes('.jpg') || url.includes('.gif') || url.includes('.png') : false;
  }
  

  isVideo(url: string): boolean {
    return url.match(/\.(mp4|webm|ogg)$/) != null;
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
}