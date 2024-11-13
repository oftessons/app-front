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
import { Filtro } from '../filtro';
import { FiltroService } from 'src/app/services/filtro.service';
import { RespostaDTO } from '../RespostaDTO'; // Adicione esta importação
import { Resposta } from '../Resposta'; // Adicione esta importação
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/login/usuario';
import { FiltroDTO } from '../filtroDTO';

import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

declare var bootstrap: any;

@Component({
  selector: 'app-page-questoes',
  templateUrl: './page-questoes.component.html',
  styleUrls: ['./page-questoes.component.css'],
})
export class PageQuestoesComponent implements OnInit, AfterViewChecked {
  
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

  nomeFiltro: string = '';
  descricaoFiltro: string = '';
  selectedAno: Ano | null = null;
  selectedDificuldade: Dificuldade | null = null;
  selectedTipoDeProva: TipoDeProva | null = null;
  selectedSubtema: Subtema | null = null;
  selectedTema: Tema | null = null;
  palavraChave: string = '';

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

  comentarioDaQuestaoSanitizado: SafeHtml = '';
  sanitizerEnunciado: SafeHtml = '';

  porcentagens: Map<string, string> | null = null;

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.obterPerfilUsuario();
    this.loadQuestao();
    const meuFiltro = history.state.questao;
    if(meuFiltro){
      this.selectedAno = meuFiltro.ano;
      this.selectedTipoDeProva = meuFiltro.tipoDeProva;
      this.selectedTema = meuFiltro.tema;
      this.selectedSubtema = meuFiltro.subtema;
      this.selectedDificuldade = meuFiltro.dificuldade;
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

  sanitizeVideoUrl(videoUrl: string | undefined): SafeResourceUrl {
    if (videoUrl) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
    }
    return ''; // Return a safe empty value if no URL is provided
  }


  ngAfterViewChecked(): void {
    this.resizeImages();
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
       // console.log("Video URL:", this.questaoAtual?.videoUrl);

      } else {
       // console.log("Video URL:", this.questaoAtual?.videoUrl);

        // Remover iframes de fontes não seguras
        iframe.remove();
      }
    }
  
    // Aplicar classes aos outros elementos
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

// Método para verificar a resposta do usuário e exibir gabarito
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

  exibirGabarito() {
    this.mostrarGabarito = true;
  
    if (this.questaoAtual) {
      this.respostaCorreta =
        this.questaoAtual.alternativas.find(
          (a) => a.texto === this.respostaCorreta
        )?.texto || '';
      this.respostaErrada =
        this.questaoAtual.alternativas.find(
          (a) => a.texto === this.respostaErrada
        )?.texto || '';
    }
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

  LimparFiltro() {
    this.selectedAno = null;
    this.selectedDificuldade = null;
    this.selectedTipoDeProva = null;
    this.selectedSubtema = null;
    this.selectedTema = null;
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
  
    if (this.selectedAno) {
      const anoSelecionado = this.anos.find(
        (ano) => this.getDescricaoAno(ano) === this.selectedAno
      );
      if (anoSelecionado) {
        filtros.ano = anoSelecionado;
      }
    }
    if (this.selectedDificuldade) {
      const dificuldadeSelecionada = this.dificuldades.find(
        (dificuldade) =>
          this.getDescricaoDificuldade(dificuldade) === this.selectedDificuldade
      );
      if (dificuldadeSelecionada) {
        filtros.dificuldade = dificuldadeSelecionada;
      }
    }
    if (this.selectedTipoDeProva) {
      const tipoDeProvaSelecionado = this.tiposDeProva.find(
        (tipoDeProva) =>
          this.getDescricaoTipoDeProva(tipoDeProva) === this.selectedTipoDeProva
      );
      if (tipoDeProvaSelecionado) {
        filtros.tipoDeProva = tipoDeProvaSelecionado;
      }
    }
    if (this.selectedSubtema) {
      const subtemaSelecionado = this.subtemas.find(
        (subtema) => this.getDescricaoSubtema(subtema) === this.selectedSubtema
      );
      if (subtemaSelecionado) {
        filtros.subtema = subtemaSelecionado;
      }
    }
    if (this.selectedTema) {
      const temaSelecionado = this.temas.find(
        (tema) => this.getDescricaoTema(tema) === this.selectedTema
      );
      if (temaSelecionado) {
        filtros.tema = temaSelecionado;
      }
    }
    // Verificar se a palavra-chave está preenchida
    if (this.palavraChave && this.palavraChave.trim() !== '') {
      filtros.palavraChave = this.palavraChave.trim();
    }
  
    console.log('Filtros aplicados:', filtros);
  
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
        }
  
        this.resposta = '';
        this.mostrarGabarito = false;
      },
      (error) => {
        console.error('Erro ao filtrar questões:', error);
        this.message = 'Ocorreu um erro ao filtrar questões. Por favor, tente novamente mais tarde.';
      }
    );
  }
  

  getMensagemNenhumaQuestaoEncontrada(filtros: any): string {
    let mensagemUsuarioTratamento = 'Nenhuma questão encontrada com os filtros selecionados: ';
  
    if (filtros.ano) {
      mensagemUsuarioTratamento += `Ano: ${this.getDescricaoAno(filtros.ano)}, `;
    }
    if (filtros.dificuldade) {
      mensagemUsuarioTratamento += `Dificuldade: ${this.getDescricaoDificuldade(filtros.dificuldade)}, `;
    }
    if (filtros.tipoDeProva) {
      mensagemUsuarioTratamento += `Tipo de Prova: ${this.getDescricaoTipoDeProva(filtros.tipoDeProva)}, `;
    }
    if (filtros.subtema) {
      mensagemUsuarioTratamento += `Subtema: ${this.getDescricaoSubtema(filtros.subtema)}, `;
    }
    if (filtros.tema) {
      mensagemUsuarioTratamento += `Tema: ${this.getDescricaoTema(filtros.tema)}, `;
    }
    if (filtros.palavraChave) {
      mensagemUsuarioTratamento += `Palavra-chave: ${filtros.palavraChave}, `;
    }
  
    // Remover a última vírgula e espaço
    return mensagemUsuarioTratamento.slice(0, -2) + '.';
  }
  

  anteriorQuestao() {
    this.jaRespondeu = false; 
    if (this.paginaAtual > 0) {
      this.paginaAtual--;
      this.questaoAtual = this.questoes[this.paginaAtual];
  
      this.selectedOption = '';
      this.isRespostaCorreta = false;
      this.mostrarGabarito = false;
      this.respostaCorreta = '';
      this.respostaErrada = '';
      this.respostaVerificada = false;
  
      this.questoesService.questaoRespondida(this.usuarioId, this.questaoAtual.id).subscribe({
        next: (resposta) => {
          if (resposta) {
            this.verificarRespostaUsuario(resposta);
            this.mostrarGabarito = true;
          } else {
            this.selectedOption = '';
            this.isRespostaCorreta = false;
            this.mostrarGabarito = false;
            this.respostaCorreta = '';
            this.respostaErrada = '';
            this.respostaVerificada = false;
          }
        },
        error: (erro) => {
          console.error('Erro ao verificar a resposta:', erro);
        },
      });
    } else {
      this.message = 'Não há mais questões disponíveis.';
    }
  }

  proximaQuestao() {
    this.jaRespondeu = false;
    if (this.paginaAtual < this.questoes.length - 1) {
      this.paginaAtual++;
      this.questaoAtual = this.questoes[this.paginaAtual];
  
      this.selectedOption = '';
      this.isRespostaCorreta = false;
      this.mostrarGabarito = false; // Gabarito desativado
      this.respostaCorreta = '';
      this.respostaErrada = '';
      this.respostaVerificada = false;
  
      this.questoesService.questaoRespondida(this.usuarioId, this.questaoAtual.id).subscribe({
        next: (resposta) => {
          if (resposta) {
            this.verificarRespostaUsuario(resposta);
          }
        },
        error: (erro) => {
          console.error('Erro ao verificar a resposta:', erro);
        },
      });
    } else {
      this.message = 'Não há mais questões disponíveis.';
    }
  }
  

  abrirModal(): void {
    const modalElement = document.getElementById('confirmacaoModal');
    const modal = new bootstrap.Modal(modalElement!);
    modal.show();

    // Adiciona evento para quando o modal for fechado
    modalElement?.addEventListener('hidden.bs.modal', () => {
      this.fecharCardConfirmacao();
    });
  }

  confirmarSalvarFiltro(nomeFiltro: string, descricaoFiltro: string): void {
    if (!this.filtroASalvar) {
      this.filtroASalvar = {} as FiltroDTO;
    }

    if (this.selectedAno) {
      const anoSelecionado = this.anos.find(
          (ano) => this.getDescricaoAno(ano) === this.selectedAno
      );
      if (anoSelecionado) {
          this.filtroASalvar.ano = anoSelecionado;
      }
    }
    if (this.selectedDificuldade) {
      const dificuldadeSelecionada = this.dificuldades.find(
          (dificuldade) =>
              this.getDescricaoDificuldade(dificuldade) === this.selectedDificuldade
      );
      if (dificuldadeSelecionada) {
          this.filtroASalvar.dificuldade = dificuldadeSelecionada; 
      }
  }

  if (this.selectedTipoDeProva) {
      const tipoDeProvaSelecionado = this.tiposDeProva.find(
          (tipoDeProva) =>
              this.getDescricaoTipoDeProva(tipoDeProva) === this.selectedTipoDeProva
      );
      if (tipoDeProvaSelecionado) {
          this.filtroASalvar.tipoDeProva = tipoDeProvaSelecionado; 
      }
  }

  if (this.selectedSubtema) {
      const subtemaSelecionado = this.subtemas.find(
          (subtema) => this.getDescricaoSubtema(subtema) === this.selectedSubtema
      );
      if (subtemaSelecionado) {
          this.filtroASalvar.subtema = subtemaSelecionado; 
      }
  }

  if (this.selectedTema) {
      const temaSelecionado = this.temas.find(
          (tema) => this.getDescricaoTema(tema) === this.selectedTema
      );
      if (temaSelecionado) {
          this.filtroASalvar.tema = temaSelecionado; // Valor do enum
      }
  }

    if (nomeFiltro) {
      this.filtroASalvar.nome = nomeFiltro;
    }
    if (descricaoFiltro) {
      this.filtroASalvar.assunto = descricaoFiltro;
    }

    if (this.filtroASalvar) {
      const idUser = parseInt(this.usuario.id);

      this.filtroService.salvarFiltro(this.filtroASalvar, idUser).subscribe(
        (response) => {
          // Tratamento de Code Status HTTP => {400, 403, 500}

          // Exibir mensagem de sucesso
          this.mensagemSucesso = 'Seu filtro foi salvo com sucesso!';

          // Esconder a mensagem após 5 segundos
          setTimeout(() => {
            this.mensagemSucesso = '';
          }, 5000);

          // Fecha o modal automaticamente após sucesso
          const modalElement = document.getElementById('confirmacaoModal');
          const modalInstance = bootstrap.Modal.getInstance(modalElement!);
          modalInstance.hide(); // Fecha o modal
        },
        (error) => {
          // Exibir mensagem de erro
          alert('Erro ao salvar o filtro. Por favor, tente novamente.');
          console.error('Erro ao salvar filtro:', error);
        }
      );
    }
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
        console.error('Erro ao carregar cometario:', error);
      }
    );
  }
}