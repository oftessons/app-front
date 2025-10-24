import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, AfterViewInit, Optional, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Chart from 'chart.js';
import { SimuladoService } from 'src/app/services/simulado.service';
import { MetricaSubtema, MetricaTema } from './metrica-interface';
import { forkJoin } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface GrupoSubtema {
  tema: string;
  subtemasFragmentados: MetricaSubtema[][];
  percentualAcertos: number;
}

interface GrupoSubtemaTemp {
  tema: string;
  subtemas: MetricaSubtema[];
  percentualAcertos: number;
}


@Component({
  selector: 'app-metricas-detalhadas',
  templateUrl: './metricas-detalhadas.component.html',
  styleUrls: ['./metricas-detalhadas.component.css']
})
export class MetricasDetalhadasComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('temaCanvas') temaCanvases!: QueryList<ElementRef>;
  @ViewChildren('acertosCanvas') acertosCanvases!: QueryList<ElementRef>; 

  carregando = true;
  dadosTema: MetricaTema[] = []; 
  dadosSubtema: MetricaSubtema[] = [];

  dadosTemaFragmentados: MetricaTema[][] = []; 
  dadosAgrupadosPorTema: GrupoSubtema[] = [];

  simuladoIdAlunoMentorado!: string | null;

  temaCharts: Chart[] = []; 
  acertosCharts: Chart[] = [];

  private themeObserver!: MutationObserver;
  private totalGraficosTema = 0; 
  private totalGraficosSubtema = 0;

  colorPalette = [
    '#3498DB', '#E74C3C', '#2ECC71', '#F1C40F', '#9B59B6', '#1ABC9C', '#E67E22',
    '#34495E', '#F39C12', '#D35400', '#C0392B', '#8E44AD', '#2980B9', '#27AE60',
    '#2C3E50', '#7F8C8D', '#16A085', '#D24D57', '#FDE3A7', '#4C566A'
  ];

  constructor(
    private simuladoService: SimuladoService,
    private route: ActivatedRoute,
    @Optional() public dialogRef: MatDialogRef<MetricasDetalhadasComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { simuladoId: string } | null
  ) {
    this.simuladoIdAlunoMentorado = data?.simuladoId ? data.simuladoId : null;
  }

  ngOnInit(): void {
    const simuladoId = this.simuladoIdAlunoMentorado
      ? Number(this.simuladoIdAlunoMentorado)
      : Number(this.route.snapshot.paramMap.get('id'));

    if (simuladoId && !isNaN(simuladoId)) {
      forkJoin({
        temas: this.simuladoService.buscarMetricasAgrupadasPorTema(simuladoId),
        subtemas: this.simuladoService.buscarMetricasDetalhadas(simuladoId)
      }).subscribe({
        next: ({ temas, subtemas }) => {
          this.dadosTema = temas.response || [];
          this.dadosSubtema = subtemas.response || [];

          this.fragmentarTemas(5); 
          this.agruparESubdividirSubtemas(5);

          this.carregando = false;

          
        },
        error: (err) => {
          console.error('ERRO FATAL: A chamada à API falhou!', err);
          this.carregando = false;
        }
      });
    } else {
      console.error("ID do simulado inválido ou não encontrado.");
      this.carregando = false;
    }
  }

  ngAfterViewInit(): void {
    this.observeThemeChanges();

    const renderTemasCallback = () => {
      if (this.temaCanvases.length > 0 &&
        this.temaCanvases.length === this.totalGraficosTema) {
        this.renderizarGraficosPorTema();
      }
    };
    this.temaCanvases.changes.subscribe(renderTemasCallback);

    const renderSubtemasCallback = () => {
      if (this.acertosCanvases.length > 0 &&
        this.acertosCanvases.length === this.totalGraficosSubtema) {
        this.renderizarGraficosPorSubtema();
      }
    };
    this.acertosCanvases.changes.subscribe(renderSubtemasCallback);
  }

  ngOnDestroy(): void {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
    this.temaCharts.forEach(chart => chart.destroy());
    this.acertosCharts.forEach(chart => chart.destroy());
  }

  private observeThemeChanges(): void {
    const targetNode = document.body;
    const config = { attributes: true, attributeFilter: ['class'] };
    const callback = (mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setTimeout(() => {
            this.renderizarGraficosPorTema();
            this.renderizarGraficosPorSubtema();
          }, 0);
        }
      }
    };
    this.themeObserver = new MutationObserver(callback);
    this.themeObserver.observe(targetNode, config);
  }

  private fragmentarTemas(limitePorGrafico: number): void {
    if (!this.dadosTema || this.dadosTema.length === 0) return;

    this.dadosTemaFragmentados = []; // Limpa o array final
    for (let i = 0; i < this.dadosTema.length; i += limitePorGrafico) {
      this.dadosTemaFragmentados.push(this.dadosTema.slice(i, i + limitePorGrafico));
    }
    this.totalGraficosTema = this.dadosTemaFragmentados.length;
  }

  private agruparESubdividirSubtemas(limitePorGrafico: number): void {
    if (!this.dadosSubtema || this.dadosSubtema.length === 0) return;

    const gruposMapTemp = this.dadosSubtema.reduce((acc, subtema) => {
      let grupo = acc.get(subtema.tema);
      if (!grupo) {
        grupo = { tema: subtema.tema, subtemas: [], percentualAcertos: 0 };
        acc.set(subtema.tema, grupo);
      }
      grupo.subtemas.push(subtema);
      return acc;
    }, new Map<string, GrupoSubtemaTemp>());

    this.dadosAgrupadosPorTema = []; 
    this.totalGraficosSubtema = 0; 

    gruposMapTemp.forEach(grupoTemp => {
      const totalAcertosGrupo = grupoTemp.subtemas.reduce((sum, s) => sum + s.totalAcertos, 0);
      const totalRespondidasGrupo = grupoTemp.subtemas.reduce((sum, s) => sum + s.totalRespondidas, 0);
      let percentualAcertos = 0;
      if (totalRespondidasGrupo > 0) {
        percentualAcertos = parseFloat(((totalAcertosGrupo / totalRespondidasGrupo) * 100).toFixed(2));
      }

      const fragmentos: MetricaSubtema[][] = [];
      for (let i = 0; i < grupoTemp.subtemas.length; i += limitePorGrafico) {
        fragmentos.push(grupoTemp.subtemas.slice(i, i + limitePorGrafico));
      }

      this.totalGraficosSubtema += fragmentos.length;

      this.dadosAgrupadosPorTema.push({
        tema: grupoTemp.tema,
        percentualAcertos: percentualAcertos,
        subtemasFragmentados: fragmentos
      });
    });
  }


  private getColorForIndex(index: number): string {
    if (index < this.colorPalette.length) {
      return this.colorPalette[index];
    }
    const hue = (index * 137.508) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }

  private renderizarGraficosPorTema(): void {
    if (!this.temaCanvases || this.temaCanvases.length === 0 || this.dadosTemaFragmentados.length === 0) {
      return;
    }

    this.temaCharts.forEach(chart => chart.destroy());
    this.temaCharts = [];

    const styles = getComputedStyle(document.body);
    const textColor = styles.getPropertyValue('--text-color').trim();
    const placeholderColor = styles.getPropertyValue('--placeholder-color').trim();
    const borderColor = styles.getPropertyValue('--border-color').trim();

    const temaCanvasesArr = this.temaCanvases.toArray();

    this.dadosTemaFragmentados.forEach((fragmento, index) => {
      const canvasAcertos = temaCanvasesArr[index]?.nativeElement;
      if (!fragmento || !canvasAcertos) return;

      const labels = fragmento.map(d => d.tema);
      const acertosData = fragmento.map(d => parseFloat(((d.totalRespondidas > 0 ? (d.totalAcertos / d.totalRespondidas) * 100 : 0)).toFixed(2)));

      const commonOptions: Chart.ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: 'bottom', labels: { fontColor: textColor, fontSize: 12 } },
        tooltips: {
          callbacks: {
            title: (tooltipItem, data) => {
              return data.labels![tooltipItem[0].index!] as string;
            },
            label: (tooltipItem, data) => {
              const index = tooltipItem.index!;
              const datasetLabel = data.datasets![tooltipItem.datasetIndex!].label;
              if (datasetLabel?.includes('Acertos')) {
                const acerto = (data.datasets![tooltipItem.datasetIndex!].data![index!] as number);
                return ` Acertos: ${acerto.toFixed(2)}%`;
              }
              return '';
            },
          }
        },
        scale: {
          ticks: { beginAtZero: true, min: 0, max: 100, fontColor: placeholderColor, backdropColor: 'transparent', stepSize: 10 },
          gridLines: { color: borderColor },
          pointLabels: { fontColor: textColor, fontSize: 14 }
        }
      };

      // Criar o gráfico
      const temaChart = new Chart(canvasAcertos, {
        type: 'polarArea',
        data: {
          labels: labels,
          datasets: [{
            label: '% de Acertos',
            data: acertosData,
            backgroundColor: acertosData.map((_, i) => this.getColorForIndex(i) + 'B3'),
            borderColor: acertosData.map((_, i) => this.getColorForIndex(i)),
            borderWidth: 1
          }]
        },
        options: { ...commonOptions }
      });
      this.temaCharts.push(temaChart);
    });
  }

  private renderizarGraficosPorSubtema(): void {
    if (!this.acertosCanvases || this.acertosCanvases.length === 0 || this.dadosAgrupadosPorTema.length === 0) {
      return;
    }

    const styles = getComputedStyle(document.body);
    const textColor = styles.getPropertyValue('--text-color').trim();
    const placeholderColor = styles.getPropertyValue('--placeholder-color').trim();
    const borderColor = styles.getPropertyValue('--border-color').trim();

    this.acertosCharts.forEach(chart => chart.destroy());
    this.acertosCharts = [];

    const acertosCanvasesArr = this.acertosCanvases.toArray();
    let canvasIndex = 0; 

    this.dadosAgrupadosPorTema.forEach((grupo) => {

      grupo.subtemasFragmentados.forEach((fragmento) => {
        const canvasAcertos = acertosCanvasesArr[canvasIndex]?.nativeElement;
        if (!fragmento || !canvasAcertos) {
          canvasIndex++; 
          return;
        }

        const labels = fragmento.map(s => s.subtema);
        const acertosData = fragmento.map(s => parseFloat(((s.totalRespondidas > 0 ? (s.totalAcertos / s.totalRespondidas) * 100 : 0)).toFixed(2)));

        const commonOptions: Chart.ChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          legend: { position: 'bottom', labels: { fontColor: textColor, fontSize: 10 } },
          tooltips: {
            callbacks: {
              title: (tooltipItem, data) => {
                return data.labels![tooltipItem[0].index!] as string;
              },
              label: (tooltipItem, data) => {
                const value = data.datasets![tooltipItem.datasetIndex!].data![tooltipItem.index!] as number;
                const datasetLabel = data.datasets![tooltipItem.datasetIndex!].label;
                return ` ${datasetLabel}: ${value.toFixed(2)}%`;
              }
            }
          },
          scale: {
            ticks: { beginAtZero: true, min: 0, max: 100, fontColor: placeholderColor, backdropColor: 'transparent', stepSize: 10 },
            gridLines: { color: borderColor },
            pointLabels: { fontColor: textColor, fontSize: 12 }
          }
        };

        const acertosChart = new Chart(canvasAcertos, {
          type: 'polarArea',
          data: {
            labels: labels,
            datasets: [{
              label: '% de Acertos',
              data: acertosData,
              backgroundColor: acertosData.map((_, i) => this.getColorForIndex(i) + 'B3'),
              borderColor: acertosData.map((_, i) => this.getColorForIndex(i)),
              borderWidth: 1
            }]
          },
          options: commonOptions
        });
        this.acertosCharts.push(acertosChart);
        canvasIndex++;
      });
    });
  }

  fecharPopup(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}