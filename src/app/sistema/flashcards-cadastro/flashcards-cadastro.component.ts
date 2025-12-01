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
  relevanciaSelecionada: string | null = null;
  dificuldadeSelecionada: string | null = null;

  optionsRelevancia = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '10', value: '10' },
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
  salvando = false;

  exibirModalStatus = false;
  statusModal: 'success' | 'error' | 'validation' = 'success';
  camposFaltando: string[] = [];

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
    }
  }

  ngOnInit(): void {
    console.log('[FlashcardsCadastro] ngOnInit');

    this.subtemasAgrupadosPorTema = Object.entries(temasESubtemas).map(
      ([temaKey, subtemas]) => {
        const temaUpper = String(temaKey).toUpperCase();
        const temaLabel = TemaDescricoes[temaKey as Tema] || temaKey;

        const subtemaOptions = subtemas.map((subtema) => {
          const rawSubtemaKey =
            typeof subtema === 'number'
              ? (Subtema as any)[subtema]
              : (subtema as any);

          const subtemaLabel = SubtemaDescricoes[subtema] || rawSubtemaKey;

          const valuePadronizado = `${temaUpper}::${String(
            rawSubtemaKey
          ).toUpperCase()}`;

          return {
            label: subtemaLabel,
            value: valuePadronizado,
          };
        });

        return {
          label: temaLabel,
          temaKey: temaUpper,
          value: temaUpper,
          options: subtemaOptions,
        };
      }
    );

    if (this.flashcardParaEditar) {
      this.modoEdicao = true;
      const card = this.flashcardParaEditar;

      this.perguntaHtml = card.pergunta;
      this.respostaHtml = card.resposta;

      if (card.fotoUrlPergunta)
        this.fotoPreviews['fotoPergunta'] = card.fotoUrlPergunta;
      if (card.fotoUrlResposta)
        this.fotoPreviews['fotoResposta'] = card.fotoUrlResposta;

      this.relevanciaSelecionada = card.relevancia
        ? String(card.relevancia)
        : null;

      this.dificuldadeSelecionada = this.normalizarDificuldade(
        card.dificuldade
      );

      if (card.tema && card.subtema) {
        const t = this.canon(card.tema);
        const s = this.canon(card.subtema);
        this.assuntoSelecionado = `${t}::${s}`;
      } else {
        this.assuntoSelecionado = null;
      }
    }
  }

  ngAfterViewInit(): void {
    console.log('[FlashcardsCadastro] ngAfterViewInit');
    this.scrollToTopGeneric();
  }

  private scrollToTopGeneric(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    const docEl = document.documentElement as HTMLElement | null;
    if (docEl) {
      docEl.scrollTop = 0;
    }

    const body = document.body as HTMLElement | null;
    if (body) {
      body.scrollTop = 0;
    }

    setTimeout(() => {
      const allElements = Array.from(
        document.querySelectorAll<HTMLElement>('*')
      );

      const scrollers: HTMLElement[] = allElements.filter((el: HTMLElement) => {
        const hasVerticalScroll = el.scrollHeight - el.clientHeight > 20;
        return hasVerticalScroll;
      });

      console.log(
        '[FlashcardsCadastro] scrollToTopGeneric -> scrollers encontrados:',
        scrollers
      );

      scrollers.forEach((el: HTMLElement) => {
        el.scrollTop = 0;
        el.scrollLeft = 0;
      });
    }, 1);
  }

  onFileSelected(event: any, fieldKey: string): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file: File = files[0];

      if (fieldKey === 'fotoPergunta') {
        this.fotoPerguntaFile = file;
      } else if (fieldKey === 'fotoResposta') {
        this.fotoRespostaFile = file;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.fotoPreviews[fieldKey] = e.target?.result ?? null;
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
    } else if (fieldKey === 'fotoResposta') {
      this.fotoRespostaFile = null;
    }
    this.fotoPreviews[fieldKey] = null;
    const fileInput = document.getElementById(fieldKey) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.cdRef.detectChanges();
  }

  isPreviewImage(preview: string | ArrayBuffer | null): boolean {
    if (!preview || typeof preview !== 'string') return false;
    const p = preview.toLowerCase();
    if (p.startsWith('data:image/')) return true;
    if (p.startsWith('http') || p.startsWith('assets/')) {
      return !this.isVideoExtension(p);
    }
    return false;
  }

  isPreviewVideo(preview: string | ArrayBuffer | null): boolean {
    if (!preview || typeof preview !== 'string') return false;
    const p = preview.toLowerCase();
    if (p.startsWith('data:video/')) return true;
    if (p.startsWith('http') || p.startsWith('assets/')) {
      return this.isVideoExtension(p);
    }
    return false;
  }

  private isVideoExtension(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some((ext) => url.includes(ext));
  }

  voltar() {
    this.location.back();
  }

  salvar(): void {
    if (this.salvando) return;

    this.camposFaltando = [];
    if (!this.assuntoSelecionado) {
      this.camposFaltando.push('Assunto');
    }
    if (!this.perguntaHtml || this.perguntaHtml.trim() === '') {
      this.camposFaltando.push('Enunciado (Pergunta)');
    }
    if (!this.respostaHtml || this.respostaHtml.trim() === '') {
      this.camposFaltando.push('Resposta');
    }

    if (this.camposFaltando.length > 0) {
      this.statusModal = 'validation';
      this.exibirModalStatus = true;
      return;
    }

    this.salvando = true;

    this.authService.obterUsuarioAutenticadoDoBackend().subscribe({
      next: (usuarioDoBackend) => {
        if (!usuarioDoBackend || !usuarioDoBackend.id) {
          this.salvando = false;
          this.router.navigate(['/login']);
          return;
        }

        const userIdNumerico = parseInt(String(usuarioDoBackend.id), 10);

        if (!this.assuntoSelecionado) {
          this.salvando = false;
          return;
        }

        const [temaExtraido, subtemaExtraido] =
          this.assuntoSelecionado.split('::');

        const temaSelecionado = temaExtraido;
        const subtemaParaEnvio = subtemaExtraido;

        const dificuldadeFinal = this.dificuldadeSelecionada
          ? this.dificuldadeSelecionada
          : (null as any);

        let relevanciaFinal = null;
        if (this.relevanciaSelecionada) {
          relevanciaFinal = parseInt(this.relevanciaSelecionada, 10);
        }

        if (this.modoEdicao && this.flashcardParaEditar) {
          const dto: ReqAtualizarFlashcardDTO = {
            pergunta: this.perguntaHtml,
            resposta: this.respostaHtml,
            tema: temaSelecionado,
            subtema: subtemaParaEnvio,
            dificuldade: dificuldadeFinal,
            relevancia: relevanciaFinal as any,
          };

          this.flashcardService
            .atualizarFlashcard(
              this.flashcardParaEditar.id,
              dto,
              this.fotoPerguntaFile || undefined,
              this.fotoRespostaFile || undefined
            )
            .subscribe({
              next: () => {
                this.salvando = false;
                this.statusModal = 'success';
                this.exibirModalStatus = true;
              },
              error: (err) => {
                this.salvando = false;
                console.error(err);
                this.statusModal = 'error';
                this.exibirModalStatus = true;
              },
            });
        } else {
          const dto: ReqSalvarFlashcardDTO = {
            pergunta: this.perguntaHtml,
            resposta: this.respostaHtml,
            tema: temaSelecionado,
            subtema: subtemaParaEnvio,
            dificuldade: dificuldadeFinal,
            relevancia: relevanciaFinal as any,
            createdBy: userIdNumerico,
          };

          this.flashcardService
            .salvarFlashcard(
              dto,
              this.fotoPerguntaFile || undefined,
              this.fotoRespostaFile || undefined
            )
            .subscribe({
              next: () => {
                this.salvando = false;
                this.statusModal = 'success';
                this.exibirModalStatus = true;
              },
              error: (err) => {
                this.salvando = false;
                console.error(err);
                this.statusModal = 'error';
                this.exibirModalStatus = true;
              },
            });
        }
      },
      error: () => {
        this.salvando = false;
        this.router.navigate(['/login']);
      },
    });
  }

  fecharModalSucesso() {
    this.exibirModalStatus = false;
    this.voltar();
  }

  fecharModalErro() {
    this.exibirModalStatus = false;
  }

  fecharModalValidacao() {
    this.exibirModalStatus = false;
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
}
