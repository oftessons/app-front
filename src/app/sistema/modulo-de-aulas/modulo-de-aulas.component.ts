import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AulasService } from 'src//app/services/aulas.service'; // Mantenha o caminho do seu serviço
import { Aula } from 'src/app/sistema/painel-de-aulas/aula'; // Mantenha o caminho da sua interface
import { Categoria } from '../painel-de-aulas/enums/categoria';
import { CategoriaDescricoes } from '../painel-de-aulas/enums/categoria-descricao';

@Component({
  selector: 'app-modulo-de-aulas',
  templateUrl: './modulo-de-aulas.component.html',
  styleUrls: ['./modulo-de-aulas.component.css']
})
export class ModuloDeAulasComponent implements OnInit {

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  aulas: Aula[] = [];
  categoria: Categoria | undefined;
  descricao: string = '';

  videoAtual: Aula | null = null;
  videoAtualIndex: number = 0;
  videosAssistidos: boolean[] = [];

  safeVideoUrl: string | null = null;
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
        console.error('Nenhum slug de categoria encontrado na URL.');
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
        console.error(`Nenhuma categoria encontrada para o slug: ${slug}`);
        this.erro = `A categoria "${slug}" não foi encontrada.`;
        this.isLoadingPage = false;
      }
    });
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
    this.safeVideoUrl = null;
    this.isLoadingVideo = false;
    this.isLoadingPage = true;
    this.erro = null;
  }

  listarAulasPorCategoria(categoria: Categoria): void {
    this.isLoadingPage = true;
    this.aulasService.listarAulasPorCategoria(categoria).subscribe({
      next: (response: Aula[]) => {
        this.aulas = response;
        this.videosAssistidos = new Array(this.aulas.length).fill(false);

        if (this.aulas.length > 0) {
          this.reproduzirVideo(this.aulas[0], 0);
        } else {
          this.isLoadingVideo = false;
        }
        this.isLoadingPage = false;
        console.log(`Aulas recebidas para ${categoria}:`, this.aulas);
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
    if (!aula || !aula.id) {
      console.error('Tentativa de reproduzir aula inválida:', aula);
      return;
    }

    this.videoAtual = aula;
    this.videoAtualIndex = index;
    this.safeVideoUrl = null;
    this.isLoadingVideo = true;

    this.aulasService.obterUrlDeVideo(aula.id).subscribe({
      next: (response: { presignedGetUrl: string }) => {
        this.safeVideoUrl = response.presignedGetUrl;
        this.isLoadingVideo = false;

        setTimeout(() => {
          if (this.videoPlayer && this.videoPlayer.nativeElement) {
            this.videoPlayer.nativeElement.load();
            this.videoPlayer.nativeElement.play().catch(e => console.error("Erro ao tentar auto-play:", e));
          }
        }, 0);
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
