import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import videojs from 'video.js';
import { AulasService, VideoUrlResponse } from 'src/app/services/aulas.service';
import { Aula } from 'src/app/sistema/painel-de-aulas/aula';

// Alias de tipo sem depender de exports de tipos da lib
type VideoJsPlayer = ReturnType<typeof videojs>;

@Component({
  selector: 'app-modulo-catarata',
  templateUrl: './modulo-catarata.component.html',
  styleUrls: ['./modulo-catarata.component.css']
})
export class ModuloCatarataComponent implements OnInit, OnDestroy {

  // Inicializa o player quando o elemento existir (mesmo se estiver sob *ngIf*)
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
  categoria = 'Catarata';
  videoAtual: Aula | null = null;
  videoAtualIndex = 0;
  videosAssistidos: boolean[] = [];
  isLoadingVideo = false;

  constructor(private aulasService: AulasService) { }

  ngOnInit(): void {
    this.listarAulasPorCategoria(this.categoria);
  }

  private initPlayer(): void {
    if (!this.videoEl) return;

    // Obs.: adicione o CSS do video.js no angular.json:
    // "styles": ["node_modules/video.js/dist/video-js.css"]
    this.player = videojs(this.videoEl.nativeElement, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      liveui: false,
      fluid: true,
      aspectRatio: '16:9',       
      html5: { vhs: { withCredentials: true } }
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

  // helper (coloque no componente)
  private normalizeUrl(u: string): string {
    const s = (u || '').trim();
    if (!s) return s;
    if (/^https?:\/\//i.test(s)) return s;    // já é absoluta
    if (/^\/\//.test(s)) return `https:${s}`; // protocolo relativo
    return `https://${s.replace(/^\/+/, '')}`; // prefixa https://
  }


  listarAulasPorCategoria(categoria: string): void {
    this.aulasService.listarAulasPorCategoria(categoria).subscribe({
      next: (response: Aula[]) => {
        this.aulas = response || [];
        this.videosAssistidos = new Array(this.aulas.length).fill(false);
        if (this.aulas.length > 0) {
          this.reproduzirVideo(this.aulas[0], 0);
        }
      },
      error: (error) => console.error('Erro ao listar aulas:', error),
    });
  }

  reproduzirVideo(aula: Aula, index: number): void {
    if (!this.player || !this.ready) {
      setTimeout(() => this.reproduzirVideo(aula, index), 80);
      return;
    }

    this.videoAtual = aula;
    this.videoAtualIndex = index;
    this.isLoadingVideo = true;

    this.aulasService.obterUrlDeVideo(aula.id!).subscribe({
      next: (res: VideoUrlResponse & { withCredentials?: boolean }) => {
        this.isLoadingVideo = false;

        const url = this.normalizeUrl(res.videoUrl);
        console.log('Definindo src =>', url);

        // monta a fonte HLS (só envia credenciais se realmente usar cookies)
        const source: any = { src: url, type: 'application/x-mpegURL' };
        if (res.withCredentials === true) source.withCredentials = true;

        this.player!.pause();
        this.player!.src(source);
        this.player!.load();

        // opcional: log de erro específico do carregamento
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
        console.error('Erro ao obter URL do vídeo', err);
        this.isLoadingVideo = false;
      }
    });
  }

  marcarComoAssistido(index: number): void {
    this.videosAssistidos[index] = true;
  }

  onVideoEnded(): void {
    this.marcarComoAssistido(this.videoAtualIndex);
    const nextIndex = this.videoAtualIndex + 1;
    if (nextIndex < this.aulas.length) {
      this.reproduzirVideo(this.aulas[nextIndex], nextIndex);
    }
  }

  formatFileName(fileName: string): string {
    return fileName.replace(/^\d+_/, '').replace(/_/g, ' ');
  }

  viewPdf(url: string): void {
    window.open(url, '_blank');
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
}
