import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { QuestoesService } from 'src/app/services/questoes.service';  // Atualize o caminho se necessário
import { Label } from 'ng2-charts';

@Component({
  selector: 'app-page-desempenho',
  templateUrl: './page-desempenho.component.html',
  styleUrls: ['./page-desempenho.component.css']
})
export class PageDesempenhoComponent implements OnInit {
  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: Label[] = []; // Será preenchido dinamicamente
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

 
  public barChartData: ChartDataSets[] = [
    { data: [], label: 'Acertos', backgroundColor: '#387F39', borderColor: '#387F39' },
    { data: [], label: 'Erros', backgroundColor: '#F5004F', borderColor: '#F5004F' }
  ];


  constructor(private questoesService: QuestoesService) { }

  ngOnInit(): void {
    this.questoesService.getAcertosEErrosPorTipoDeProva().subscribe(data => {
      this.processChartData(data);
    });
  }

  private processChartData(data: any): void {
    // Tipos de provas definidos no backend
    const tiposDeProva = [
      'Prova de Bases (Teórica 1)',
      'Prova de Especialidades (Teórica 2)',
      'Prova de Imagens (Teórico-prática)'
    ];

    // Inicializa arrays para rótulos e dados do gráfico
    this.barChartLabels = tiposDeProva;
    const errosData: number[] = [];
    const acertosData: number[] = [];

    // Preenche os arrays de dados com base na resposta do backend
    tiposDeProva.forEach(tipo => {
      const tipoData = data[tipo] || { acertos: 0, erros: 0 };
      acertosData.push(tipoData.acertos);
      errosData.push(tipoData.erros);
    });

    // Atualiza os dados do gráfico
    this.barChartData = [
      { data: acertosData, label: 'Acertos', backgroundColor: '#387F39', borderColor: '#387F39', borderWidth: 1 },
      { data: errosData, label: 'Erros', backgroundColor: '#F5004F', borderColor: '#F5004F', borderWidth: 1 }
    ];
  }
}
