import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AulasService } from 'src/app/services/aulas.service';
import { AvaliacaoAulaService } from 'src/app/services/avaliacao-aula.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Aula } from 'src/app/sistema/painel-de-aulas/aula';
import { Categoria } from '../painel-de-aulas/enums/categoria';
import { CategoriaDescricoes } from '../painel-de-aulas/enums/categoria-descricao';
import { AvaliacaoAula } from './avaliacao-aula';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { VdoCipherPlaybackResponse } from './video-cipher-playblack-response';

@Component({
  selector: 'app-modulo-de-aulas',
  templateUrl: './modulo-de-aulas.component.html',
  styleUrls: ['./modulo-de-aulas.component.css']
})
export class ModuloDeAulasComponent implements OnInit, OnDestroy {

  vdoCipherUrl: SafeResourceUrl | null = null;

  aulas: Aula[] = [];
  categoria: Categoria | undefined;
  descricao: string = '';

  private _videoAtual: Aula | null = null;

  get videoAtual(): Aula | null {
    return this._videoAtual;
  }

  set videoAtual(aula: Aula | null) {
    if (this._videoAtual?.id === aula?.id) {
      return;
    }
    this._videoAtual = aula;

    if (aula) {
      this.videoAtualIndex = this.aulas.findIndex(a => a.id === aula.id);
      this.carregarVideo(aula);
      this.carregarAvaliacaoAula(aula.id);
    } else {
      this.vdoCipherUrl = null;
    }
  }

  videoAtualIndex: number = 0;
  videosAssistidos: boolean[] = [];

  avaliacaoAtual: number = 0;
  mediaAvaliacoes: number = 0;
  totalAvaliacoes: number = 0;
  estrelas: number[] = [1, 2, 3, 4, 5];
  hoverStar: number = 0;

  isLoadingVideo: boolean = false;
  isLoadingPage: boolean = true;
  erro: string | null = null;

  private destroy$ = new Subject<void>();
  private moduloSlug: string | null = null;
  private hasLoadedAulas = false;

  constructor(
    private aulasService: AulasService,
    private avaliacaoService: AvaliacaoAulaService,
    public themeService: ThemeService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.moduloSlug = this.route.snapshot.paramMap.get('modulo');

    if (!this.moduloSlug) {
      this.erro = 'Categoria não encontrada.';
      this.isLoadingPage = false;
      return;
    }

    const categoriaEncontrada = Object.keys(Categoria).find(
      (key) =>
        this.generateSlug(
          CategoriaDescricoes[Categoria[key as keyof typeof Categoria]]
        ) === this.moduloSlug
    );

    if (categoriaEncontrada) {
      this.categoria = Categoria[categoriaEncontrada as keyof typeof Categoria];
      this.descricao = CategoriaDescricoes[this.categoria];
      this.resetState();
      this.listarAulasPorCategoria(this.descricao as Categoria);
    } else {
      this.erro = `A categoria "${this.moduloSlug}" não foi encontrada.`;
      this.isLoadingPage = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateSlug(text: string): string {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  goBack() {
    this.location.back();
  }

  voltarPagina(): void {
    this.location.back();
  }

  resetState(): void {
    this.aulas = [];
    this._videoAtual = null;
    this.videoAtualIndex = 0;
    this.videosAssistidos = [];
    this.isLoadingVideo = false;
    this.isLoadingPage = true;
    this.erro = null;
    this.hasLoadedAulas = false;
    this.vdoCipherUrl = null;
  }

  listarAulasPorCategoria(categoria: Categoria): void {
    this.isLoadingPage = true;
    this.aulasService.listarAulasPorCategoria(categoria).subscribe({
      next: (response: Aula[]) => {
        this.aulas = response || [];
        this.videosAssistidos = new Array(this.aulas.length).fill(false);
        this.isLoadingPage = false;
        this.hasLoadedAulas = true;

        if (this.aulas.length > 0) {
          this.ouvirMudancasDeAulaNaUrl();
        } else {
          this.isLoadingVideo = false;
        }
      },
      error: (error) => {
        console.error(`Erro ao listar aulas para ${categoria}:`, error);
        this.erro = 'Erro ao carregar as aulas. Tente novamente mais tarde.';
        this.isLoadingPage = false;
        this.isLoadingVideo = false;
      }
    });
  }

  private ouvirMudancasDeAulaNaUrl(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (!this.hasLoadedAulas) return;

        const aulaSlug = params.get('aulaSlug');

        if (aulaSlug) {
          const aulaEncontrada = this.aulas.find(
            a => this.generateSlug(a.titulo) === aulaSlug
          );

          if (aulaEncontrada) {
            this.videoAtual = aulaEncontrada;
          } else {
            console.warn(`Aula slug "${aulaSlug}" não encontrada.`);
            this.videoAtual = null; // Mostra placeholder
          }
        } else {
          // Se não há slug, mostra placeholder
          this.videoAtual = null;
        }
      });
  }

  public selecionarVideo(aula: Aula): void {
    if (!this.moduloSlug) return;

    const aulaSlug = this.generateSlug(aula.titulo);

    this.router.navigate(['usuario', 'painel-de-aulas', this.moduloSlug, aulaSlug], {
      replaceUrl: false
    });
  }

  // --- LÓGICA VDOCIPHER AQUI ---
  private carregarVideo(aula: Aula): void {
    if (!aula || !aula.id) return;

    this.isLoadingVideo = true;
    this.vdoCipherUrl = null;

    this.aulasService.obterUrlDeVideo(aula.id).subscribe({
      next: (res: VdoCipherPlaybackResponse) => {
        this.isLoadingVideo = false;

        const rawUrl = `https://player.vdocipher.com/v2/?otp=${res.otp}&playbackInfo=${res.playbackInfo}`;

        this.vdoCipherUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      },
      error: (err) => {
        console.error("Erro ao obter credenciais VdoCipher", err);
        this.erro = 'Não foi possível carregar o vídeo.';
        this.isLoadingVideo = false;
      }
    });
  }

  marcarComoAssistido(index: number): void {
    this.videosAssistidos[index] = true;
    console.log(`Marcou aula ${index} como assistida.`);
  }


  formatFileName(fileName: string): string {
    if (!fileName) return '';
    return fileName.replace(/^\d+_/, '').replace(/_/g, ' ');
  }

  viewPdf(url: string): void {
    window.open(url, '_blank');
  }


  carregarAvaliacaoAula(idAula: number): void {
    this.avaliacaoService.obterAvaliacaoUsuario(idAula)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (avaliacao) => {
          this.avaliacaoAtual = avaliacao?.nota || 0;
        },
        error: (error) => {
          this.avaliacaoAtual = 0;
        }
      });

    this.avaliacaoService.obterMediaAvaliacoes(idAula)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (media) => {
          this.mediaAvaliacoes = media.media || 0;
          this.totalAvaliacoes = media.total || 0;
        },
        error: (error) => {
          this.mediaAvaliacoes = 0;
          this.totalAvaliacoes = 0;
        }
      });
  }

  avaliarAula(nota: number): void {
    if (!this.videoAtual?.id) return;

    this.avaliacaoAtual = nota;

    const avaliacao: AvaliacaoAula = {
      idAula: this.videoAtual.id,
      nota: nota
    };

    this.avaliacaoService.avaliarAula(avaliacao)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.carregarAvaliacaoAula(this.videoAtual!.id);
        },
        error: (error) => {
          console.error('Erro ao avaliar aula:', error);
        }
      });
  }

  onStarHover(star: number): void { this.hoverStar = star; }
  onStarLeave(): void { this.hoverStar = 0; }

  isStarFilled(star: number): boolean {
    if (this.hoverStar > 0) return star <= this.hoverStar;
    return star <= this.avaliacaoAtual;
  }

  getStarIcon(star: number): string {
    const isFilled = this.isStarFilled(star);
    const isDark = this.themeService.isDarkMode();
    const basePath = 'assets/Icons';

    if (isDark) {
      return isFilled ? `${basePath}/dark/estrela-preenchida-dark.svg` : `${basePath}/dark/estrela-vazia-dark.svg`;
    } else {
      return isFilled ? `${basePath}/estrela-preenchida.svg` : `${basePath}/estrela-vazia.svg`;
    }
  }

  getAverageStarIcon(): string {
    const isDark = this.themeService.isDarkMode();
    return isDark
      ? 'assets/Icons/dark/estrela-preenchida-dark.svg'
      : 'assets/Icons/estrela-preenchida.svg';
  }
}