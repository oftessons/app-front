import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { Tema } from '../page-questoes/enums/tema';
import { Subtema } from '../page-questoes/enums/subtema';
import { temasESubtemas } from '../page-questoes/enums/map-tema-subtema';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { SubtemaDescricoes } from '../page-questoes/enums/subtema-descricao';
import { Location } from '@angular/common';
import {
  FlashcardService,
  ReqSalvarFlashcardDTO,
  Flashcard,
  ReqAtualizarFlashcardDTO,
} from 'src/app/services/flashcards.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-flashcards-cadastro',
  templateUrl: './flashcards-cadastro.component.html',
  styleUrls: ['./flashcards-cadastro.component.css'],
})
export class FlashcardsCadastroComponent implements OnInit, AfterViewInit {
  subtemasAgrupadosPorTema: {
    label: string;
    temaKey: string;
    disabled?: boolean;
    selectable?: boolean;
    options: { label: string; value: string }[];
  }[] = [];

  assuntoSelecionado: string | null = null;
  relevanciaSelecionada: number | null = null;
  dificuldadeSelecionada: string | null = null;

  optionsRelevancia = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
  ];

  optionsDificuldade = [
    { label: 'Fácil', value: 'FACIL' },
    { label: 'Médio', value: 'MEDIO' },
    { label: 'Difícil', value: 'DIFICIL' },
  ];

  perguntaHtml = '';
  respostaHtml = '';

  fotoPerguntaFile: File | null = null;
  fotoRespostaFile: File | null = null;
  
  fotoPreviews: { [key: string]: string | ArrayBuffer | null } = {};

  flashcardParaEditar: Flashcard | null = null;
  modoEdicao = false;

  constructor(
    private location: Location,
    private flashcardService: FlashcardService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.flashcardParaEditar = navigation.extras.state[
        'flashcard'
      ] as Flashcard;
      console.log(`[DEBUG - CADASTRO] Modo Edição ativado. Flashcard ID: ${this.flashcardParaEditar.id}`);
    }
  }

  ngOnInit(): void {
    this.subtemasAgrupadosPorTema = Object.entries(temasESubtemas).map(
      ([temaKey, subtemas]) => {
        const temaEnum = temaKey as Tema;
        const temaLabel = TemaDescricoes[temaEnum] || temaKey;

        const subtemaOptions = subtemas.map((subtema) => {
          const subtemaKey =
            typeof subtema === 'number'
              ? (Subtema as any)[subtema]
              : (subtema as any);
          const subtemaLabel = SubtemaDescricoes[subtema] || subtemaKey;
          return { label: subtemaLabel, value: subtemaKey };
        });

        return {
          label: temaLabel,
          temaKey: temaKey,
          value: temaKey,
          options: subtemaOptions,
        };
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.flashcardParaEditar) {
      this.modoEdicao = true;
      const card = this.flashcardParaEditar;
      this.perguntaHtml = card.pergunta;
      this.respostaHtml = card.resposta;

      if (card.fotoUrlPergunta) {
        this.fotoPreviews['fotoPergunta'] = card.fotoUrlPergunta;
        console.log(`[DEBUG - CADASTRO] Foto Pergunta carregada para edição: ${card.fotoUrlPergunta}`);
      }
      if (card.fotoUrlResposta) {
        this.fotoPreviews['fotoResposta'] = card.fotoUrlResposta;
        console.log(`[DEBUG - CADASTRO] Foto Resposta carregada para edição: ${card.fotoUrlResposta}`);
      }

      setTimeout(() => {
        this.relevanciaSelecionada = card.relevancia ?? null;
        this.dificuldadeSelecionada = this.normalizarDificuldade(
          card.dificuldade ?? null
        );

        if (card.subtema && !this.isSubtemaFallbackDoTema(card)) {
          this.assuntoSelecionado = this.findMatchingSubtema(card.subtema);
        } else if (card.tema) {
          this.assuntoSelecionado = this.findMatchingTema(card.tema);
        } else {
          this.assuntoSelecionado = null;
        }
        
        console.log(`[DEBUG - CADASTRO] Dados carregados: Tema/Subtema: ${this.assuntoSelecionado}, Dificuldade: ${this.dificuldadeSelecionada}`);

        this.cdRef.detectChanges();
      }, 0);
    }
  }

  onFileSelected(event: any, fieldKey: string): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file: File = files[0];
      
      if (fieldKey === 'fotoPergunta') {
        this.fotoPerguntaFile = file;
        console.log(`[DEBUG - CADASTRO] Arquivo Pergunta selecionado: ${file.name}`);
      } else if (fieldKey === 'fotoResposta') {
        this.fotoRespostaFile = file;
        console.log(`[DEBUG - CADASTRO] Arquivo Resposta selecionado: ${file.name}`);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.fotoPreviews[fieldKey] = e.target?.result ?? null;
        console.log(`[DEBUG - CADASTRO] Preview ${fieldKey} gerado.`);
        this.cdRef.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onDrop(event: DragEvent, fieldKey: string): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const mockEvent = { target: { files: files } };
      this.onFileSelected(mockEvent, fieldKey);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  removeFile(fieldKey: string, event: Event): void {
    event.stopPropagation();

    if (fieldKey === 'fotoPergunta') {
        this.fotoPerguntaFile = null;
        console.log(`[DEBUG - CADASTRO] Arquivo Pergunta removido.`);
    } else if (fieldKey === 'fotoResposta') {
        this.fotoRespostaFile = null;
        console.log(`[DEBUG - CADASTRO] Arquivo Resposta removido.`);
    }

    this.fotoPreviews[fieldKey] = null;

    const fileInput = document.getElementById(fieldKey) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.cdRef.detectChanges();
  }

  isPreviewImage(preview: string | ArrayBuffer | null): boolean {
    if (typeof preview !== 'string') return false;

    return preview.toLowerCase().startsWith('data:image/');
  }

  isPreviewVideo(preview: string | ArrayBuffer | null): boolean {
    if (typeof preview !== 'string') return false;
    return preview.toLowerCase().startsWith('data:video/');
  }

  isDarkMode(): boolean {
    return false;
  }

  voltar() {
    this.location.back();
  }

  salvar(): void {
    if (!this.assuntoSelecionado || !this.perguntaHtml || !this.respostaHtml) {
      console.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.authService.obterUsuarioAutenticadoDoBackend().subscribe({
      next: (usuarioDoBackend) => {
        if (!usuarioDoBackend || !usuarioDoBackend.id) {
          console.error(
            'Erro crítico: Não foi possível obter os dados do usuário logado. Faça o login novamente.'
          );
          this.router.navigate(['/login']);
          return;
        }

        const userIdNumerico = parseInt(String(usuarioDoBackend.id), 10);
        if (isNaN(userIdNumerico)) {
          console.error('Erro crítico: O ID do usuário retornado é inválido.');
          return;
        }

        const temaSelecionado = this.encontrarTemaAPartirDoAssunto(
          this.assuntoSelecionado!
        );
        if (!temaSelecionado) {
          console.error(
            'Erro: não foi possível determinar o tema a partir do assunto selecionado.'
          );
          return;
        }

        const subtemaParaEnvio = this.resolveSubtemaParaEnvio(
          this.assuntoSelecionado!,
          temaSelecionado
        );

        const dificuldadeFinal = this.dificuldadeSelecionada
          ? this.dificuldadeSelecionada
          : (null as any);

        const relevanciaFinal = this.relevanciaSelecionada
          ? this.relevanciaSelecionada
          : (null as any);

        console.log('[DEBUG - CADASTRO] Preparando DTO para envio...');
        console.log(`[DEBUG - CADASTRO] Tema: ${temaSelecionado}, Subtema: ${subtemaParaEnvio}`);
        console.log(`[DEBUG - CADASTRO] File Pergunta: ${this.fotoPerguntaFile?.name || 'Nenhum'}`);
        console.log(`[DEBUG - CADASTRO] File Resposta: ${this.fotoRespostaFile?.name || 'Nenhum'}`);


        if (this.modoEdicao && this.flashcardParaEditar) {
          const dto: ReqAtualizarFlashcardDTO = {
            pergunta: this.perguntaHtml,
            resposta: this.respostaHtml,
            tema: temaSelecionado,
            subtema: subtemaParaEnvio,
            dificuldade: dificuldadeFinal,
            relevancia: relevanciaFinal,
          };
          
          console.log(`[DEBUG - CADASTRO] Chamando atualização para ID: ${this.flashcardParaEditar.id}`);

          this.flashcardService
            .atualizarFlashcard(
              this.flashcardParaEditar.id,
              dto,
              this.fotoPerguntaFile || undefined, 
              this.fotoRespostaFile || undefined
            )
            .subscribe({
              next: () => {
                console.log('Flashcard atualizado com sucesso!');
                this.voltar();
              },
              error: (erro) => {
                console.error('Erro ao atualizar flashcard:', erro);
              },
            });
        } else {
          const dto: ReqSalvarFlashcardDTO = {
            pergunta: this.perguntaHtml,
            resposta: this.respostaHtml,
            tema: temaSelecionado,
            subtema: subtemaParaEnvio,
            dificuldade: dificuldadeFinal,
            relevancia: relevanciaFinal,
            createdBy: userIdNumerico,
          };

          console.log('[DEBUG - CADASTRO] Chamando cadastro de novo flashcard.');

          this.flashcardService
            .salvarFlashcard(
                dto, 
                this.fotoPerguntaFile || undefined, 
                this.fotoRespostaFile || undefined
            )
            .subscribe({
              next: () => {
                console.log('Flashcard salvo com sucesso!');
                this.voltar();
              },
              error: (erro) => {
                console.error('Erro ao salvar flashcard:', erro);

                const mensagem =
                  typeof erro === 'string'
                    ? erro
                    : (erro as any)?.error
                    ? (erro as any).error
                    : (erro as any)?.message
                    ? (erro as any).message
                    : 'Erro desconhecido ao salvar o flashcard.';

                console.error(`Erro ao salvar: ${mensagem}`);
              },
            });
        }
      },
      error: (err) => {
        console.error('Erro ao buscar perfil do usuário:', err);
        console.error(
          'Erro ao buscar dados do usuário. Sua sessão pode ter expirado.'
        );
        this.router.navigate(['/login']);
      },
    });
  }
  private encontrarTemaAPartirDoAssunto(chaveAssunto: string): string | null {
    if (!chaveAssunto) return null;

    const grupoTemaDireto = this.subtemasAgrupadosPorTema.find(
      (g) => g.temaKey === chaveAssunto
    );
    if (grupoTemaDireto) {
      return grupoTemaDireto.temaKey;
    }

    for (const grupo of this.subtemasAgrupadosPorTema) {
      const found = grupo.options.find((opt) => opt.value === chaveAssunto);
      if (found) return grupo.temaKey;
    }

    return null;
  }

  private resolveSubtemaParaEnvio(
    assunto: string,
    temaSelecionado: string
  ): string {
    const ehTema = this.subtemasAgrupadosPorTema.some(
      (g) => g.temaKey === assunto
    );

    if (ehTema) {
      return this.canon(temaSelecionado);
    }

    return assunto;
  }

  private isSubtemaFallbackDoTema(card: Flashcard): boolean {
    if (!card.tema || !card.subtema) return false;
    return this.canon(card.subtema) === this.canon(card.tema);
  }

  private canon(s: string): string {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();
  }

  private normalizarDificuldade(v?: string | null): string | null {
    if (!v) return null;
    const x = this.canon(v);
    if (x === 'MEDIA' || x === 'MEDIO' || x === 'INTERMEDIARIO') return 'MEDIO';
    if (x === 'FACIL' || x === 'EASY') return 'FACIL';
    if (x === 'DIFICIL' || x === 'HARD') return 'DIFICIL';
    return ['FACIL', 'MEDIO', 'DIFICIL'].includes(x) ? x : null;
  }

  private findMatchingSubtema(v?: string | null): string | null {
    if (!v) return null;
    const wanted = this.canon(v);
    for (const g of this.subtemasAgrupadosPorTema) {
      for (const opt of g.options) {
        const key = this.canon(String(opt.value));
        if (key === wanted) return opt.value;
      }
    }
    return null;
  }

  private findMatchingTema(v?: string | null): string | null {
    if (!v) return null;
    const wanted = this.canon(v);
    for (const g of this.subtemasAgrupadosPorTema) {
      const key = this.canon(g.temaKey);
      if (key === wanted) return g.temaKey;
    }
    return null;
  }
}