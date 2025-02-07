import { Component, OnInit } from '@angular/core';
import { AulasService } from 'src/app/services/aulas.service';
import { Aula } from 'src/app/sistema/painel-de-aulas/aula';

@Component({
  selector: 'app-modulo-optica-refratometria-visao-subnormal',
  templateUrl: './modulo-optica-refratometria-visao-subnormal.component.html',
  styleUrls: ['./modulo-optica-refratometria-visao-subnormal.component.css']
})
export class ModuloOpticaRefratometriaVisaoSubnormalComponent implements OnInit {
  aulas: Aula[] = [];
  categoria: string = 'Óptica, Refraometria e Visão Subnormal';
  videoAtual: Aula | null = null;
  videoAtualIndex: number = 0;
  videosAssistidos: boolean[] = [];

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
        console.log('Aulas recebidas:', this.aulas);
      },
      (error) => {
        console.error('Erro ao listar aulas:', error);
      }
    );
  }

  reproduzirVideo(aula: Aula, index: number): void {
    this.videoAtual = aula;
    this.videoAtualIndex = index;
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
}
