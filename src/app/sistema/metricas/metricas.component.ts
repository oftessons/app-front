import { Component, OnInit } from '@angular/core';
import { DashboardMetrics, DashboardOptions, MetricasService, SelectOption, TopicStats } from 'src/app/services/metricas.service';
  

@Component({
  selector: 'app-metricas',
  templateUrl: './metricas.component.html',
  styleUrls: ['./metricas.component.css']
})
export class MetricasComponent implements OnInit {

  metrics: DashboardMetrics | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Variáveis para os filtros (ligadas ao ngModel no HTML se necessário)
  selectedAno: string = '';
  selectedTipo: string = '';
  selectedDificuldade: string = '';

  anosDisponiveis: SelectOption[] = [];
  tiposProvaDisponiveis: SelectOption[] = [];
  dificuldadesDisponiveis: SelectOption[] = [];

  constructor(private metricasService: MetricasService) { }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadMetrics();
  }

  loadFilterOptions(): void {
    this.metricasService.getFilterOptions().subscribe({
      next: (options: DashboardOptions) => {
        this.anosDisponiveis = options.anos;
        this.tiposProvaDisponiveis = options.tiposProva;
        this.dificuldadesDisponiveis = options.dificuldades;
      },
      error: (err) => {
        console.error('Falha ao carregar filtros', err);
      }
    });
  }

  loadMetrics(): void {
    this.isLoading = true;
    this.metricasService.getMetrics(
      this.selectedAno, 
      this.selectedTipo, 
      this.selectedDificuldade
    ).subscribe({
        next: (data) => {
          this.metrics = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  onFilterChange(): void {
    this.loadMetrics();
  }

  toggleRow(topic: TopicStats): void {
    topic.expanded = !topic.expanded;
  }

  getTileClass(index: number): string {
    const variations = ['tile-blue-1', 'tile-blue-2', 'tile-blue-3'];
    return variations[index % variations.length];
  }

  getMosaicClasses(index: number): string {
    const colorClass = `tile-blue-${(index % 3) + 1}`; // Alterna entre 1, 2 e 3
    let sizeClass = '';

    // O 1º item (mais frequente) ganha destaque maior
    if (index === 0) {
      sizeClass = 'span-large';
    } 
    // O 2º e 3º ganham destaque médio ou alto
    else if (index === 1) {
      sizeClass = 'span-medium';
    } 
    else if (index === 2) {
      sizeClass = 'span-tall';
    }

    return `${colorClass} ${sizeClass}`;
  }

}
