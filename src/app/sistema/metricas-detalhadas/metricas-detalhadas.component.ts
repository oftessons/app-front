import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, AfterViewInit, Optional, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Chart from 'chart.js';
import { SimuladoService } from 'src/app/services/simulado.service';
import { MetricaSubtema, MetricaTema } from './metrica-interface';
import { forkJoin } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface GrupoSubtema {
  tema: string;
  subtemas: MetricaSubtema[];
}

@Component({
  selector: 'app-metricas-detalhadas',
  templateUrl: './metricas-detalhadas.component.html',
  styleUrls: ['./metricas-detalhadas.component.css']
})
export class MetricasDetalhadasComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('subtemaCanvas') subtemaCanvases!: QueryList<ElementRef>;

  carregando = true;
  dadosTema: MetricaTema[] = [];
  dadosSubtema: MetricaSubtema[] = [];
  dadosAgrupadosPorTema: GrupoSubtema[] = [];
  simuladoIdAlunoMentorado!: string | null;

  temaChart: Chart | null = null;
  subtemaCharts: Chart[] = [];
  
  private themeObserver!: MutationObserver;

  colorPalette = [
    '#F2613F', '#3FD2F2', '#A53FF2', '#F2B83F',
    '#3FF261', '#F23F92', '#3F6FF2'
  ];

  constructor(
    private simuladoService: SimuladoService,
    private route: ActivatedRoute,

    @Optional() @Inject(MAT_DIALOG_DATA) public data: { simuladoId: string } | null
  ) { 

    this.simuladoIdAlunoMentorado = data?.simuladoId ? data?.simuladoId : null; 
  }

  ngOnInit(): void {
    const simuladoId = this.simuladoIdAlunoMentorado ?  Number(this.simuladoIdAlunoMentorado) : Number(this.route.snapshot.paramMap.get('id'));

    if (simuladoId && !isNaN(simuladoId)) {
      forkJoin({
        temas: this.simuladoService.buscarMetricasAgrupadasPorTema(simuladoId),
        subtemas: this.simuladoService.buscarMetricasDetalhadas(simuladoId)
      }).subscribe({
        next: ({ temas, subtemas }) => {
          this.dadosTema = temas.response || [];
          this.dadosSubtema = subtemas.response || [];
          this.agruparSubtemasPorTema();
          this.carregando = false;

          setTimeout(() => {
            this.renderizarGraficoPorTema();
            this.renderizarGraficosPorSubtema();
          }, 0);
        },
        error: (err) => {
          console.error('ERRO FATAL: A chamada à API falhou!', err);
          this.carregando = false;
        }
      });
    } else {
      console.error("ID do simulado inválido ou não encontrado na URL.");
      this.carregando = false;
    }
  }

  ngAfterViewInit(): void {
    this.observeThemeChanges();

    this.subtemaCanvases.changes.subscribe(() => {
      this.renderizarGraficosPorSubtema();
    });
  }

  ngOnDestroy(): void {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  private observeThemeChanges(): void {
    const targetNode = document.body;
    const config = { attributes: true, attributeFilter: ['class'] };

    const callback = (mutationsList: MutationRecord[], observer: MutationObserver) => {
      for(const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          console.log('Mudança de tema detectada! Redesenhando gráficos...');
          setTimeout(() => {
            this.renderizarGraficoPorTema();
            this.renderizarGraficosPorSubtema();
          }, 0);
        }
      }
    };

    this.themeObserver = new MutationObserver(callback);
    this.themeObserver.observe(targetNode, config);
  }

  private agruparSubtemasPorTema(): void {
    if (!this.dadosSubtema || this.dadosSubtema.length === 0) return;
    const grupos = this.dadosSubtema.reduce((acc, subtema) => {
      let grupo = acc.find(g => g.tema === subtema.tema);
      if (!grupo) {
        grupo = { tema: subtema.tema, subtemas: [] };
        acc.push(grupo);
      }
      grupo.subtemas.push(subtema);
      return acc;
    }, [] as GrupoSubtema[]);
    this.dadosAgrupadosPorTema = grupos;
  }

  private renderizarGraficoPorTema(): void {
    if (!this.dadosTema || this.dadosTema.length === 0) return;
    const canvas = document.getElementById('graficoPorTema') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.temaChart) {
      this.temaChart.destroy();
    }
    
    const styles = getComputedStyle(document.body);
    const textColor = styles.getPropertyValue('--text-color').trim();
    const placeholderColor = styles.getPropertyValue('--placeholder-color').trim();
    const borderColor = styles.getPropertyValue('--border-color').trim();

    const labels = this.dadosTema.map(d => d.tema);
    const data = this.dadosTema.map(d => {
      const percentage = d.totalRespondidas > 0 ? (d.totalAcertos / d.totalRespondidas) * 100 : 0;
      return parseFloat(percentage.toFixed(3));
    });

    this.temaChart = new Chart(canvas, {
      type: 'polarArea',
      data: {
        labels: labels,
        datasets: [{
          label: '% de Acertos',
          data: data,
          backgroundColor: data.map((_, i) => this.colorPalette[i % this.colorPalette.length] + 'B3'),
          borderColor: data.map((_, i) => this.colorPalette[i % this.colorPalette.length]),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          position: 'bottom',
          labels: { fontColor: textColor, fontSize: 12 }
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => `${tooltipItem.yLabel} %`
          }
        },
        scale: {
          ticks: {
            beginAtZero: true,
            min: 0,
            max: 100,
            fontColor: placeholderColor,
            backdropColor: 'transparent',
            stepSize: 25
          },
          gridLines: { color: borderColor },
          pointLabels: {
            fontColor: textColor,
            fontSize: 14
          }
        }
      }
    });
  }

  private renderizarGraficosPorSubtema(): void {
    if (!this.subtemaCanvases || this.subtemaCanvases.length === 0) return;

    const styles = getComputedStyle(document.body);
    const textColor = styles.getPropertyValue('--text-color').trim();
    const placeholderColor = styles.getPropertyValue('--placeholder-color').trim();
    const borderColor = styles.getPropertyValue('--border-color').trim();

    this.subtemaCharts.forEach(chart => chart.destroy());
    this.subtemaCharts = [];

    this.subtemaCanvases.forEach((canvasRef, index) => {
      const grupo = this.dadosAgrupadosPorTema[index];
      if (!grupo) return;

      const canvas = canvasRef.nativeElement;
      const labels = grupo.subtemas.map(s => s.subtema);
      const data = grupo.subtemas.map(s => {
        const percentage = s.totalRespondidas > 0 ? (s.totalAcertos / s.totalRespondidas) * 100 : 0;
        return parseFloat(percentage.toFixed(2));
      });

      const newChart = new Chart(canvas, {
        type: 'polarArea',
        data: {
          labels: labels,
          datasets: [{
            label: '% de Acertos',
            data: data,
            backgroundColor: data.map((_, i) => this.colorPalette[i % this.colorPalette.length] + 'B3'),
            borderColor: data.map((_, i) => this.colorPalette[i % this.colorPalette.length]),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            position: 'bottom',
            labels: { fontColor: textColor, fontSize: 12 }
          },
          tooltips: {
            callbacks: {
              label: (tooltipItem, data) => `${tooltipItem.yLabel} %`
            }
          },
          scale: {
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 100,
              fontColor: placeholderColor,
              backdropColor: 'transparent',
              stepSize: 25
            },
            gridLines: { color: borderColor },
            pointLabels: {
              fontColor: textColor,
              fontSize: 12
            }
          }
        }
      });
      this.subtemaCharts.push(newChart);
    });
  }
}