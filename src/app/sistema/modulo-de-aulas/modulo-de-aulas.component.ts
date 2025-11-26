import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { catchError, takeUntil } from 'rxjs/operators';
import { Subject, forkJoin, of } from 'rxjs';
import { VdoCipherPlaybackResponse } from './video-cipher-playblack-response';
import { EstatisticasAulasService } from 'src/app/services/estatisticas-aulas.service';
import { MetricasAulasResponse } from './metricas-aulas-response';

declare var VdoPlayer: any;

@Component({
  selector: 'app-modulo-de-aulas',
  templateUrl: './modulo-de-aulas.component.html',
  styleUrls: ['./modulo-de-aulas.component.css']
})
export class ModuloDeAulasComponent implements OnInit, OnDestroy {

  @ViewChild('vdoIframe') vdoIframe: any;

  vdoCipherUrl: SafeResourceUrl | null = null;


  private tempoInterval: any = null;

  aulas: Aula[] = [];
  categoria: Categoria | undefined;
  descricao: string = '';
  metricasAulas: MetricasAulasResponse[] = [];
  tempoAssistidoAtual: number = 0;
  aulaParaContinuar: Aula | null = null;

  private _videoAtual: Aula | null = null;

  get videoAtual(): Aula | null {
    return this._videoAtual;
  }

  set videoAtual(aula: Aula | null) {
    if (this._videoAtual?.id === aula?.id) return;

    this._videoAtual = aula;

    if (aula) {
      this.videoAtualIndex = this.aulas.findIndex(a => a.id === aula.id);
      this.carregarVideo(aula);
      this.carregarAvaliacaoAula(aula.id);
      this.obterQuantidadeAvaliacaoDoUsuarioLogado(aula.id);
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
    private sanitizer: DomSanitizer,
    private estatistiacasAulasService: EstatisticasAulasService
  ) { }

  ngOnInit(): void {
    this.moduloSlug = this.route.snapshot.paramMap.get('modulo');

    if (!this.moduloSlug) {
      this.erro = 'Categoria não encontrada.';
      this.isLoadingPage = false;
      return;
    }

    const categoriaEncontrada = Object.keys(Categoria).find(
      key => this.generateSlug(CategoriaDescricoes[Categoria[key as keyof typeof Categoria]]) === this.moduloSlug
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

    if (this.tempoInterval) {
      clearInterval(this.tempoInterval);
      this.tempoInterval = null;
    }
  }

  generateSlug(text: string): string {
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
    this.tempoAssistidoAtual = 0;
  }

  listarAulasPorCategoria(categoria: Categoria): void {
    this.isLoadingPage = true;

    forkJoin({
      aulas: this.aulasService.listarAulasPorCategoria(categoria),
      metricas: this.estatistiacasAulasService.obterMetricasAulasPorCategoria(categoria),
      ultimaAulaId: this.estatistiacasAulasService.obterUltimaAulaAssistida(this.descricao).pipe(
        catchError(() => of(null))
      )
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ aulas, metricas, ultimaAulaId }) => {

          this.aulas = Array.isArray(aulas) ? aulas : [];
          this.metricasAulas = Array.isArray(metricas?.result) ? metricas.result : [];

          this.videosAssistidos = this.aulas.map(aula => {
            const m = this.metricasAulas.find(x => x.aulaId === aula.id);
            return m ? m.concluida : false;
          });

          if (ultimaAulaId) {
            this.aulaParaContinuar = this.aulas.find(a => a.id === ultimaAulaId) || null;
          } else if (this.aulas.length > 0) {
            this.aulaParaContinuar = this.aulas[0];
          }

          this.isLoadingPage = false;
          this.hasLoadedAulas = true;

          if (this.aulas.length > 0) {
            this.ouvirMudancasDeAulaNaUrl();
          }
        },
        error: () => {
          this.erro = 'Erro ao carregar módulo. Tente novamente mais tarde.';
          this.isLoadingPage = false;
        }
      });
  }

  continuarDeOndeParou(): void {
    if (this.aulaParaContinuar) {
      this.selecionarVideo(this.aulaParaContinuar);
    }
  }

  private ouvirMudancasDeAulaNaUrl(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (!this.hasLoadedAulas) return;

        const aulaSlug = params.get('aulaSlug');
        if (!aulaSlug) {
          this.videoAtual = null;
          return;
        }

        const aula = this.aulas.find(a => this.generateSlug(a.titulo) === aulaSlug);
        this.videoAtual = aula || null;
      });
  }

  selecionarVideo(aula: Aula): void {
    if (!this.moduloSlug) return;

    const aulaSlug = this.generateSlug(aula.titulo);

    this.router.navigate(['usuario', 'painel-de-aulas', this.moduloSlug, aulaSlug], {
      replaceUrl: false
    });
  }

  private carregarVideo(aula: Aula): void {
    if (!aula.id) return;

    console.log('Carregando vídeo para aula ID:', aula.id);

    this.isLoadingVideo = true;
    this.vdoCipherUrl = null;

    this.estatistiacasAulasService.obterTempoAssistidoAula(aula.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.tempoAssistidoAtual = 0;
          return of(0);
        })
      )
      .subscribe({
        next: (tempo) => {
          this.tempoAssistidoAtual = tempo ?? 0;

          this.aulasService.obterUrlDeVideo(aula.id).subscribe({
            next: (res: VdoCipherPlaybackResponse) => {
              this.isLoadingVideo = false;

              const rawUrl = `https://player.vdocipher.com/v2/?otp=${res.otp}&playbackInfo=${res.playbackInfo}`;
              this.vdoCipherUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);

              this.inicializarVdoCipherPlayer();
            },
            error: () => {
              this.erro = 'Não foi possível carregar o vídeo.';
              this.isLoadingVideo = false;
            }
          });

        }
      });
  }

  private inicializarVdoCipherPlayer(): void {
    setTimeout(() => {
      if (!this.vdoIframe) return;

      const iframeEl = this.vdoIframe.nativeElement;
      if (!iframeEl) return;

      try {
        const player = VdoPlayer.getInstance(iframeEl);
        if (!player?.video) return;

        player.video.addEventListener('loadedmetadata', () => {
          if (this.tempoAssistidoAtual && this.tempoAssistidoAtual > 0) {
            player.video.currentTime = this.tempoAssistidoAtual;
          }
        });


        player.video.addEventListener('play', () => {
          if (this.tempoInterval) clearInterval(this.tempoInterval);

          this.tempoInterval = setInterval(() => {
            if (this.videoAtual?.id && player.video && !player.video.paused) {
              const tempoAtual = Math.floor(player.video.currentTime);

              this.estatistiacasAulasService.salvarTempoAssistido(this.videoAtual.id, tempoAtual)
                .pipe(takeUntil(this.destroy$))
                .subscribe({ error: (err) => console.error(err) });
            }
          }, 10000);
        });

        let ultimoTempoRegistrado = 0;
        player.video.addEventListener('timeupdate', () => {
          const tempoAtual = Math.floor(player.video.currentTime);
          if (Math.abs(tempoAtual - ultimoTempoRegistrado) > 3) {
            console.log("Usuário mudou a minutagem para:", tempoAtual);
          }
          ultimoTempoRegistrado = tempoAtual;
        });

        player.video.addEventListener('pause', () => {
          if (this.tempoInterval) {
            clearInterval(this.tempoInterval);
            this.tempoInterval = null;
          }
        });

        player.video.addEventListener('ended', () => {
          if (this.tempoInterval) {
            clearInterval(this.tempoInterval);
            this.tempoInterval = null;
          }
          this.marcarComoAssistido(this.videoAtualIndex);
        });

      } catch (error) {
        console.error("Erro ao inicializar player:", error);
      }
    }, 800);
  }

  marcarComoAssistido(index: number): void {
    this.videosAssistidos[index] = true;

    this.estatistiacasAulasService.concluirAula(this.aulas[index].id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log(`Aula ${this.aulas[index].titulo} marcada como assistida.`),
        error: () => console.error('Erro ao marcar aula como assistida.')
      });
  }

  toggleConclusaoAula(): void {
    if (!this.videoAtual?.id) return;

    const index = this.videoAtualIndex;
    const estaConcluida = this.videosAssistidos[index];

    if (estaConcluida) {
      this.estatistiacasAulasService.removerStatusConclusaoAula(this.videoAtual.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.videosAssistidos[index] = false;
            console.log('Conclusão removida com sucesso');
          },
          error: (err) => console.error('Erro ao remover conclusão', err)
        });
    } else {
      this.estatistiacasAulasService.concluirAula(this.videoAtual.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.videosAssistidos[index] = true;
            console.log('Aula marcada como concluída');
          },
          error: (err) => console.error('Erro ao concluir aula', err)
        });
    }
  }

  obterQuantidadeAvaliacaoDoUsuarioLogado(idAula: number): void {
    this.estatistiacasAulasService.obterQuantidadeAvaliacaoDoUsuarioLogado(idAula)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (quantidadeAvaliacao) => {
          this.avaliacaoAtual = quantidadeAvaliacao;
        },
        error: () => {
          this.avaliacaoAtual = 0;
        }
      });
  }


  carregarAvaliacaoAula(idAula: number): void {
    this.estatistiacasAulasService.obterQuantidadeAvaliacoes(idAula)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.totalAvaliacoes = result.avaliacoes;

        },
        error: () => {
          this.totalAvaliacoes = 0;
          this.avaliacaoAtual = 0;
        }
      });

    this.estatistiacasAulasService.obterMediaAvaliacoes(idAula)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (media) => {
          this.mediaAvaliacoes = media || 0;
        },
        error: () => {
          this.mediaAvaliacoes = 0;
        }
      });
  }


  avaliarAula(nota: number): void {
    if (!this.videoAtual?.id) return;

    this.avaliacaoAtual = nota;

    this.estatistiacasAulasService.avaliarAula(this.videoAtual.id, nota)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.carregarAvaliacaoAula(this.videoAtual!.id)
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

    return isDark
      ? (isFilled ? `${basePath}/dark/estrela-preenchida-dark.svg` : `${basePath}/dark/estrela-vazia-dark.svg`)
      : (isFilled ? `${basePath}/estrela-preenchida.svg` : `${basePath}/estrela-vazia.svg`);
  }

  getAverageStarIcon(): string {
    return this.themeService.isDarkMode()
      ? 'assets/Icons/dark/estrela-preenchida-dark.svg'
      : 'assets/Icons/estrela-preenchida.svg';
  }

  formatFileName(fileName: string): string {
    return fileName ? fileName.replace(/^\d+_/, '').replace(/_/g, ' ') : '';
  }

  viewPdf(url: string): void {
    window.open(url, '_blank');
  }
}
