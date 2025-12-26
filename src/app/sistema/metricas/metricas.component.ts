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
  selectedAnos: string[] = [];
  selectedTipos: string[] = [];
  selectedDificuldades: string[] = [];

  // --- Opções para os Dropdowns (Vindas do Banco) ---
  anosDisponiveis: SelectOption[] = [];
  tiposProvaDisponiveis: SelectOption[] = [];
  dificuldadesDisponiveis: SelectOption[] = [];

  private readonly STORAGE_KEY = 'dashboard_filters_pref_v1';

  constructor(private metricasService: MetricasService) { }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadFiltersFromStorage();
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
    this.errorMessage = null;

    this.metricasService.getMetrics(
      this.selectedAnos, 
      this.selectedTipos, 
      this.selectedDificuldades
    ).subscribe({
        next: (data: DashboardMetrics) => {
          this.metrics = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar métricas:', err);
          this.errorMessage = 'Não foi possível carregar os dados do painel.';
          this.isLoading = false;
        }
      });
  }

  onFilterChange(): void {
    this.saveFiltersToStorage();
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

  private loadFiltersFromStorage(): void {
    const savedData = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedData) {
      try {
        const filters = JSON.parse(savedData);

        if (Array.isArray(filters.anos)) {
          this.selectedAnos = filters.anos;
        }
        
        if (Array.isArray(filters.tipos)) {
          this.selectedTipos = filters.tipos;
        }
        
        if (Array.isArray(filters.dificuldades)) {
          this.selectedDificuldades = filters.dificuldades;
        }

      } catch (e) {
        console.error('Erro ao ler filtros salvos. Resetando preferências.', e);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }
  private saveFiltersToStorage(): void {
    const stateToSave = {
      anos: this.selectedAnos,
      tipos: this.selectedTipos,
      dificuldades: this.selectedDificuldades
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
  }

}
