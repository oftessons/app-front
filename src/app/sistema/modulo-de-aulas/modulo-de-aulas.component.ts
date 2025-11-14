import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AulasService } from 'src/app/services/aulas.service';
import { Aula } from 'src/app/sistema/painel-de-aulas/aula';
import { Categoria } from '../painel-de-aulas/enums/categoria';
import { CategoriaDescricoes } from '../painel-de-aulas/enums/categoria-descricao';
import { VideoUrlResponse } from './video-url-response';

import videojs from 'video.js';
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

  videoAtual: Aula | null = null;
  videoAtualIndex: number = 0;
  videosAssistidos: boolean[] = [];

  isLoadingVideo: boolean = false;
  isLoadingPage: boolean = true;
  erro: string | null = null;

  constructor(
    private aulasService: AulasService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('modulo');
      if (!slug) {
        this.erro = 'Categoria não encontrada.';
        this.isLoadingPage = false;
        return;
      }

      const categoriaEncontrada = Object.keys(Categoria).find(
        (key) =>
          this.generateSlug(
            CategoriaDescricoes[Categoria[key as keyof typeof Categoria]]
          ) === slug
      );

      if (categoriaEncontrada) {
        this.categoria = Categoria[categoriaEncontrada as keyof typeof Categoria];
        this.descricao = CategoriaDescricoes[this.categoria];
        this.resetState();
        this.listarAulasPorCategoria(this.descricao as Categoria);
      } else {
        this.erro = `A categoria "${slug}" não foi encontrada.`;
        this.isLoadingPage = false;
      }
    });
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

      console.log('Player Video.js inicializado');
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
    if (this.player) {
      this.player.off('ended');
      this.player.off('error');
      this.player.dispose();
      this.player = undefined;
      this.ready = false;
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

  resetState(): void {
    this.aulas = [];
    this.videoAtual = null;
    this.videoAtualIndex = 0;
    this.videosAssistidos = [];
    this.isLoadingVideo = false;
    this.isLoadingPage = true;
    this.erro = null;
  }

  listarAulasPorCategoria(categoria: Categoria): void {
    this.isLoadingPage = true;
    this.aulasService.listarAulasPorCategoria(categoria).subscribe({
      next: (response: Aula[]) => {
        this.aulas = response || [];
        this.videosAssistidos = new Array(this.aulas.length).fill(false);

        if (this.aulas.length > 0) {
          this.reproduzirVideo(this.aulas[0], 0);
        } else {
          this.isLoadingVideo = false;
        }
        this.isLoadingPage = false;
      },
      error: (error) => {
        console.error(`Erro ao listar aulas para ${categoria}:`, error);
        this.erro = 'Erro ao carregar as aulas. Tente novamente mais tarde.';
        this.isLoadingPage = false;
        this.isLoadingVideo = false;
      }
    });
  }

  reproduzirVideo(aula: Aula, index: number): void {
    if (!this.player || !this.ready) {
      setTimeout(() => this.reproduzirVideo(aula, index), 80);
      return;
    }

    if (!aula || !aula.id) {
      console.error('Tentativa de reproduzir aula inválida:', aula);
      return;
    }

    this.videoAtual = aula;
    this.videoAtualIndex = index;
    this.isLoadingVideo = true;

    this.aulasService.obterUrlDeVideo(aula.id).subscribe({
      next: (res: VideoUrlResponse & { withCredentials?: boolean }) => {
        this.isLoadingVideo = false;

        const url = this.normalizeUrl(res.videoUrl);
        console.log('Definindo src =>', url);

        const source: any = { src: url, type: 'application/x-mpegURL' };
        if (res.withCredentials === true) source.withCredentials = true;

        this.player!.pause();
        this.player!.src(source);
        this.player!.load();

        const onErr = () => {
          const err = this.player!.error();
          console.error('Erro no carregamento HLS:', err?.code, err?.message, err);
          this.player!.off('error', onErr);
        };
        this.player!.one('error', onErr);

        this.player!.one('loadedmetadata', () => {
          console.log('loadedmetadata. currentSrc =', this.player!.currentSrc());
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
      this.reproduzirVideo(this.aulas[nextIndex], nextIndex);
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
}