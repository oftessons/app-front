import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { AulasService } from 'src//app/services/aulas.service';

import { Aula } from 'src/app/sistema/painel-de-aulas/aula';



@Component({

  selector: 'app-modulo-catarata',

  templateUrl: './modulo-catarata.component.html',

  styleUrls: ['./modulo-catarata.component.css']

})

export class ModuloCatarataComponent implements OnInit {



  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;



  aulas: Aula[] = [];

  categoria: string = 'Catarata';

  videoAtual: Aula | null = null;

  videoAtualIndex: number = 0;

  videosAssistidos: boolean[] = [];



  safeVideoUrl: string | null = null;

  isLoadingVideo: boolean = false;



  constructor(

    private aulasService: AulasService

  ) { }



  ngOnInit(): void {

    this.listarAulasPorCategoria(this.categoria);

  }



  listarAulasPorCategoria(categoria: string): void {

    this.aulasService.listarAulasPorCategoria(categoria).subscribe(

      (response: Aula[]) => {

        this.aulas = response;

        this.videosAssistidos = new Array(this.aulas.length).fill(false);



        if (this.aulas.length > 0) {

          this.videoAtual = this.aulas[0];

          this.videoAtualIndex = 0;

        }

        console.log('Aulas recebidas (metadados):', this.aulas);

      },

      (error) => {

        console.error('Erro ao listar aulas:', error);

      }

    );

  }





  reproduzirVideo(aula: Aula, index: number): void {

    this.videoAtual = aula;

    this.videoAtualIndex = index;



    this.safeVideoUrl = null;

    this.isLoadingVideo = true;



    this.aulasService.obterUrlDeVideo(aula.id!).subscribe({

      next: (response: { presignedGetUrl: string }) => {



        // 4. Recebemos a URL!

        this.safeVideoUrl = response.presignedGetUrl;

        this.isLoadingVideo = false;





        setTimeout(() => {

          if (this.videoPlayer) {

            this.videoPlayer.nativeElement.load();

            this.videoPlayer.nativeElement.play();

          }

        }, 0);

      },

      error: (err) => {

        console.error("Erro ao obter URL do vídeo", err);

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

}