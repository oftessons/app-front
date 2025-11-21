import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AulasService } from 'src/app/services/aulas.service';
import { AvaliacaoAulaService } from 'src/app/services/avaliacao-aula.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Aula } from 'src/app/sistema/painel-de-aulas/aula';
import { Categoria } from '../painel-de-aulas/enums/categoria';
import { CategoriaDescricoes } from '../painel-de-aulas/enums/categoria-descricao';
import { VideoUrlResponse } from './video-url-response';
import { AvaliacaoAula } from './avaliacao-aula';

import videojs from 'video.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type VideoJsPlayer = ReturnType<typeof videojs>;

@Component({
  selector: 'app-modulo-de-aulas',
  templateUrl: './modulo-de-aulas.component.html',
  styleUrls: ['./modulo-de-aulas.component.css']
})
export class ModuloDeAulasComponent implements OnInit, OnDestroy {

  @ViewChild('videoPlayer', { static: false })
  set videoPlayerSetter(ref: ElementRef<HTMLVideoElement> | undefined) {
    if (ref) {
      this.videoEl = ref;
      if (!this.player) this.initPlayer();
    }
  }
  private videoEl?: ElementRef<HTMLVideoElement>;
  private player?: VideoJsPlayer;
  private ready = false;

  aulas: Aula[] = [];
  categoria: Categoria | undefined;
  descricao: string = '';

  // Setter reativo para videoAtual
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
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
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

  private initPlayer(): void {
    if (!this.videoEl) return;

    this.player = videojs(this.videoEl.nativeElement, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      liveui: false,
      fluid: true,
      aspectRatio: '16:9',
      html5: { vhs: { withCredentials: true } },
      controlBar: {
        playbackRateMenuButton: true
      },
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2]
    } as any, () => {
      this.ready = true;
      this.player!.on('ended', () => this.onVideoEnded());
      this.player!.on('error', () => {
        const err = this.player!.error();
        console.error('Video.js error:', err?.code, err?.message, err);
      });
    });
  }

  private normalizeUrl(u: string): string {
    const s = (u || '').trim();
    if (!s) return s;
    if (/^https?:\/\//i.test(s)) return s;
    if (/^\/\//.test(s)) return `https:${s}`;
    return `https://${s.replace(/^\/+/, '')}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.player) {
      this.player.off('ended');
      this.player.off('error');
      this.player.dispose();
      this.player = undefined;
      this.ready = false;
    }
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

  resetState(): void {
    this.aulas = [];
    this.videoAtual = null;
    this.videoAtualIndex = 0;
    this.videosAssistidos = [];
    this.isLoadingVideo = false;
    this.isLoadingPage = true;
    this.erro = null;
    this.hasLoadedAulas = false;
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
            console.warn(`Aula slug "${aulaSlug}" não encontrada. Redirecionando...`);
            this.redirectToPrimeiraAula();
          }
        } else {
          this.redirectToPrimeiraAula();
        }
      });
  }

  private redirectToPrimeiraAula(): void {
    if (!this.aulas || this.aulas.length === 0) return;

    const primeiroSlug = this.generateSlug(this.aulas[0].titulo);

    // Esta navegação está CORRETA. Ela anexa o slug à rota .../:modulo
    this.router.navigate([primeiroSlug], {
      relativeTo: this.route,
      replaceUrl: true
    });
  }

  // selecionarVideo agora NAVEGA
  public selecionarVideo(aula: Aula): void {
    const slug = this.generateSlug(aula.titulo);

    // *** ÚNICA MUDANÇA É AQUI ***
    // Adicionado '../' para navegar "para cima" antes de adicionar o novo slug
    this.router.navigate(['../', slug], {
      relativeTo: this.route,
      replaceUrl: false // false = adiciona ao histórico (bom p/ botão voltar)
    });
  }

  private carregarVideo(aula: Aula): void {
    if (!this.player || !this.ready) {
      setTimeout(() => this.carregarVideo(aula), 80);
      return;
    }
    if (!aula || !aula.id) {
      console.error('Tentativa de carregar aula inválida:', aula);
      return;
    }

    this.isLoadingVideo = true;
    this.aulasService.obterUrlDeVideo(aula.id).subscribe({
      next: (res: VideoUrlResponse) => {
        this.isLoadingVideo = false;
        if (!this.player) return;

        const url = this.normalizeUrl(res.videoUrl);
    
        const source: any = {
          src: url,
          type: 'application/x-mpegURL',
          withCredentials: true
        };

        console.log("Debug: Carregando vídeo com URL", url);

        this.player.playbackRate(1);
        this.player.pause();
        this.player.src(source);
        this.player.load();

        const onErr = () => {
          const err = this.player!.error();
          console.error('Erro no carregamento HLS:', err?.code, err?.message, err);
          this.player!.off('error', onErr);
        };
        this.player.one('error', onErr);

        this.player.one('loadedmetadata', () => {
          const p = this.player!.play();
          if (p?.catch) {
            p.catch((e: any) => {
              if (e?.name !== 'AbortError') {
                console.warn('Play bloqueado/autoplay ou outro erro:', e);
              }
            });
          }
        });
      },
      error: (err) => {
        console.error("Erro ao obter URL do vídeo", err);
        this.erro = 'Não foi possível carregar o vídeo.';
        this.isLoadingVideo = false;
      }
    });
  }

  marcarComoAssistido(index: number): void {
    this.videosAssistidos[index] = true;
    console.log(`Marcou aula ${index} como assistida.`);
  }

  onVideoEnded(): void {
    this.marcarComoAssistido(this.videoAtualIndex);
    const nextIndex = this.videoAtualIndex + 1;
    if (nextIndex < this.aulas.length) {
      const proximaAula = this.aulas[nextIndex];
      this.selecionarVideo(proximaAula);
    } else {
      console.log('Todas as aulas do módulo foram concluídas.');
    }
  }

  formatFileName(fileName: string): string {
    if (!fileName) return '';
    return fileName.replace(/^\d+_/, '').replace(/_/g, ' ');
  }

  viewPdf(url: string): void {
    window.open(url, '_blank');
  }

  voltarPagina(): void {
    this.location.back();
  }

  carregarAvaliacaoAula(idAula: number): void {
    this.avaliacaoService.obterAvaliacaoUsuario(idAula)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (avaliacao) => {
          this.avaliacaoAtual = avaliacao?.nota || 0;
        },
        error: (error) => {
          //console.error('Erro ao carregar avaliação do usuário:', error);
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
          //console.error('Erro ao carregar média de avaliações:', error);
          this.mediaAvaliacoes = 0;
          this.totalAvaliacoes = 0;
        }
      });
  }

  avaliarAula(nota: number): void {
    if (!this.videoAtual?.id) {
      //console.error('Nenhuma aula selecionada para avaliar');
      return;
    }

    this.avaliacaoAtual = nota;

    const avaliacao: AvaliacaoAula = {
      idAula: this.videoAtual.id,
      nota: nota
    };

    //console.log('📤 Enviando avaliação:', avaliacao);

    this.avaliacaoService.avaliarAula(avaliacao)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.carregarAvaliacaoAula(this.videoAtual!.id);
          //console.log(`✅ Aula avaliada com ${nota} estrelas`);
        },
        error: (error) => {
          //console.error('❌ Erro ao avaliar aula:', error);
        }
      });
  }

  onStarHover(star: number): void {
    this.hoverStar = star;
  }

  onStarLeave(): void {
    this.hoverStar = 0;
  }

  isStarFilled(star: number): boolean {
    if (this.hoverStar > 0) {
      return star <= this.hoverStar;
    }
    return star <= this.avaliacaoAtual;
  }

  getStarIcon(star: number): string {
    const isFilled = this.isStarFilled(star);
    const isDark = this.themeService.isDarkMode();

    if (isDark) {
      return isFilled 
        ? 'assets/Icons/dark/estrela-preenchida-dark.svg' 
        : 'assets/Icons/dark/estrela-vazia-dark.svg';
    } else {
      return isFilled 
        ? 'assets/Icons/estrela-preenchida.svg' 
        : 'assets/Icons/estrela-vazia.svg';
    }
  }

  getStarClass(star: number): string {
    return this.isStarFilled(star) ? 'fas fa-star' : 'far fa-star';
  }

  getAverageStarIcon(): string {
    const isDark = this.themeService.isDarkMode();
    return isDark 
      ? 'assets/Icons/dark/estrela-preenchida-dark.svg'
      : 'assets/Icons/estrela-preenchida.svg';
  }
}