import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { QuestoesService } from 'src/app/services/questoes.service';  // Atualize o caminho se necessário
import { Label } from 'ng2-charts';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';

@Component({
  selector: 'app-page-desempenho',
  templateUrl: './page-desempenho.component.html',
  styleUrls: ['./page-desempenho.component.css']
})
export class PageDesempenhoComponent implements OnInit {
  // Gráfico 1: Acertos e Erros por Tipo de Prova
  public barChartOptions1: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          stepSize: 1  // Define a escala para números inteiros
        }
      }]
    }
  };
  public barChartLabels1: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartData1: ChartDataSets[] = [
    { data: [], label: 'Acertos', backgroundColor: '#387F39', borderColor: '#387F39' },
    { data: [], label: 'Erros', backgroundColor: '#F5004F', borderColor: '#F5004F' }
  ];

  // Gráfico 2: Quantidade de Questões Feitas por Tema
  public barChartOptions2: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          stepSize: 1  // Define a escala para números inteiros
        }
      }]
    }
  };
  public barChartLabels2: Label[] = [];
  public barChartData2: ChartDataSets[] = [
    { data: [], label: 'Questões Feitas', backgroundColor: '#FFA500', borderColor: '#FFA500' }
  ];

  // Gráfico 3: Acertos e Erros por Mês
  public barChartOptions3: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          stepSize: 1  // Define a escala para números inteiros
        }
      }]
    }
  };
  public barChartLabels3: string[] = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  public barChartData3: ChartDataSets[] = [
    { data: [], label: 'Acertos', backgroundColor: '#A2CA71', borderColor: '#A2CA71' },
    { data: [], label: 'Erros', backgroundColor: '#F5004F', borderColor: '#F5004F' }
  ];

  constructor(private questoesService: QuestoesService) { }

  ngOnInit(): void {
    this.questoesService.getAcertosEErrosPorTipoDeProva().subscribe(data => {
      this.processChartData1(data);
    });

    this.questoesService.getQuestoesFeitasPorTema(1).subscribe(data => {
      this.processChartData2(data);
    });

    this.questoesService.getAcertosEErrosPorMes(1).subscribe(data => {
      this.processChartData3(data);
    });
  }

  private processChartData1(data: any): void {
    const tiposDeProva = [
      'Prova de Bases (Teórica 1)',
      'Prova de Especialidades (Teórica 2)',
      'Prova de Imagens (Teórico-prática)'
    ];

    this.barChartLabels1 = tiposDeProva;
    const errosData: number[] = [];
    const acertosData: number[] = [];

    tiposDeProva.forEach(tipo => {
      const tipoData = data[tipo] || { acertos: 0, erros: 0 };
      acertosData.push(tipoData.acertos);
      errosData.push(tipoData.erros);
    });

    this.barChartData1 = [
      { data: acertosData, label: 'Acertos', backgroundColor: '#387F39', borderColor: '#387F39' },
      { data: errosData, label: 'Erros', backgroundColor: '#F5004F', borderColor: '#F5004F' }
    ];
  }

  private processChartData2(data: Map<string, number>): void {
    // Mapear os temas para exibição no gráfico
    const temas = Object.values(TemaDescricoes);
    this.barChartLabels2 = temas;

    // Garantir que a ordem dos dados corresponda à ordem dos temas
    const questoesFeitasData = temas.map(tema => data.get(tema) || 0);

    this.barChartData2 = [
      { data: questoesFeitasData, label: 'Questões Feitas', backgroundColor: '#FFA500', borderColor: '#FFA500' }
    ];
  }

  private processChartData3(data: Map<string, Map<string, number>>): void {
    const acertosData: number[] = new Array(12).fill(0);
    const errosData: number[] = new Array(12).fill(0);

    this.barChartLabels3.forEach((mes, index) => {
      const mesData = data.get(mes);
      if (mesData) {
        acertosData[index] = mesData.get('acertos') || 0;
        errosData[index] = mesData.get('erros') || 0;
      }
    });

    this.barChartData3 = [
      { data: acertosData, label: 'Acertos', backgroundColor: '#A2CA71', borderColor: '#A2CA71' },
      { data: errosData, label: 'Erros', backgroundColor: '#F5004F', borderColor: '#F5004F' }
    ];
  }
}
