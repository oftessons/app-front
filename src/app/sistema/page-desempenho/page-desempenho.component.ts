import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { QuestoesService } from 'src/app/services/questoes.service'; // Atualize o caminho se necessário
import { Label } from 'ng2-charts';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/login/usuario';

@Component({
  selector: 'app-page-desempenho',
  templateUrl: './page-desempenho.component.html',
  styleUrls: ['./page-desempenho.component.css'],
})
export class PageDesempenhoComponent implements OnInit {
  usuario!: Usuario;
  
  // Gráfico 1: Acertos e Erros por Tipo de Prova
  public barChartOptions1: ChartOptions = {
    responsive: true,
    title: {
      display: true,
      text: 'Acertos e Erros por Tipo de Prova'
    },
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true,
            stepSize: 1, // Define a escala para números inteiros
          },
        },
      ],
    },
  };
  public barChartLabels1: Label[] = [];
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = true;
  public barChartData1: ChartDataSets[] = [
    {
      data: [],
      label: 'Acertos',
      backgroundColor: '#1C9212',
      borderColor: '#1C9212',
    },
    {
      data: [],
      label: 'Erros',
      backgroundColor: '#3B5FA0',
      borderColor: '#3B5FA0',
    },
  ];

  // Gráfico 2: Quantidade de Questões Feitas por Tema
  public barChartOptions2: ChartOptions = {
    responsive: true,
    title: {
      display: true,
      text: 'Quantidade de Questões Feitas por Tema'
    },
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true,
            stepSize: 1, // Define a escala para números inteiros
          },
        },
      ],
    },
  };
  public barChartLabels2: Label[] = [];
  public barChartData2: ChartDataSets[] = [
    {
      data: [],
      label: 'Questões Feitas',
      backgroundColor: '#FFA500',
      borderColor: '#FFA500',
    },
  ];

  // Gráfico 3: Acertos e Erros por Mês
  public barChartOptions3: ChartOptions = {
    responsive: true,
    title: {
      display: true,
      text: 'Acertos e Erros por Mês'
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            stepSize: 1, // Define a escala para números inteiros
          },
        },
      ],
    },
  };
  public barChartType3: ChartType = 'bar';
  public barChartLabels3: string[] = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  public barChartData3: ChartDataSets[] = [
    {
      data: [],
      label: 'Acertos',
      backgroundColor: '#1C9212',
      borderColor: '#1C9212',
    },
    {
      data: [],
      label: 'Erros',
      backgroundColor: '#3B5FA0',
      borderColor: '#3B5FA0',
    },
  ];

  // Gráfico 4: Acertos e Erros por Tema
  public barChartOptions4: ChartOptions = {
    responsive: true,
    title: {
      display: true,
      text: 'Acertos e Erros por Tema'
    },
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true,
            stepSize: 1,
          },
        },
      ],
    },
  };
  public barChartLabels4: Label[] = [];
  public barChartData4: ChartDataSets[] = [
    {
      data: [],
      label: 'Acertos',
      backgroundColor: '#1C9212',
      borderColor: '#1C9212',
    },
    {
      data: [],
      label: 'Erros',
      backgroundColor: '#3B5FA0',
      borderColor: '#3B5FA0',
    },
  ];

  constructor(
    private questoesService: QuestoesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        this.usuario = data;
        const idUser = parseInt(this.usuario.id);

        this.questoesService
          .getAcertosEErrosPorTipoDeProva(idUser)
          .subscribe((data1) => {
            this.processChartData1(data1);
          });

        this.questoesService
          .getQuestoesFeitasPorTema(idUser)
          .subscribe((data2) => {
            this.processChartData2(data2);
          });

        this.questoesService
          .getAcertosEErrosPorMes(idUser)
          .subscribe((data3) => {
            const dataMap = this.convertBackendDataToMap(data3);
            this.processChartData3(dataMap);
          });

        this.questoesService
          .getAcertosErrosPorTema(idUser)
          .subscribe((data4) => {
            this.processChartData4(data4);
          });
      },
      (error) => {
        console.error('Erro ao obter perfil do usuário:', error);
      }
    );
  }

  private processChartData1(data: any): void {
    const tiposDeProva = [
      'Prova de Bases (Teórica 1)',
      'Prova de Especialidades (Teórica 2)',
      'Prova de Imagens (Teórico-prática)',
    ];

    this.barChartLabels1 = tiposDeProva;
    const errosData: number[] = [];
    const acertosData: number[] = [];

    tiposDeProva.forEach((tipo) => {
      const tipoData = data[tipo] || { acertos: 0, erros: 0 };
      acertosData.push(tipoData.acertos);
      errosData.push(tipoData.erros);
    });

    this.barChartData1 = [
      {
        data: acertosData,
        label: 'Acertos',
        backgroundColor: '#0A275E',
        borderColor: '#0A275E',
        hoverBackgroundColor: '#113A87',
        hoverBorderColor: '#113A87',
      },
      {
        data: errosData,
        label: 'Erros',
        backgroundColor: '#4E5E7B',
        borderColor: '#4E5E7B',
        hoverBackgroundColor: '#667A9F',
        hoverBorderColor: '#667A9F',
      },
    ];
  }

  private processChartData2(data: any): void {
    const temas = Object.values(TemaDescricoes);
    this.barChartLabels2 = temas;

    const questoesFeitasData = temas.map((tema) => data[tema] || 0);

    this.barChartData2 = [
      {
        data: questoesFeitasData,
        label: 'Questões Feitas',
        backgroundColor: '#D69C11',
        borderColor: '#D69C11',
        hoverBackgroundColor: '#FFBF23',
        hoverBorderColor: '#FFBF23',
      },
    ];
  }

  private processChartData4(data: any): void {
    const temas = Object.values(TemaDescricoes);
    this.barChartLabels4 = temas;

    const acertosData = temas.map((tema) => data[tema]?.acertos || 0);
    const errosData = temas.map((tema) => data[tema]?.erros || 0);

    this.barChartData4 = [
      {
        data: acertosData,
        label: 'Acertos',
        backgroundColor: '#1C9212',
        borderColor: '#1C9212',
        hoverBackgroundColor: '#113A87',
        hoverBorderColor: '#113A87',
      },
      {
        data: errosData,
        label: 'Erros',
        backgroundColor: '#3B5FA0',
        borderColor: '#3B5FA0',
        hoverBackgroundColor: '#667A9F',
        hoverBorderColor: '#667A9F',
      },
    ];
  }

  private processChartData3(data: Map<string, Map<string, number>>): void {
    const acertosData: number[] = new Array(12).fill(0);
    const errosData: number[] = new Array(12).fill(0);

    this.barChartLabels3.forEach((mes, index) => {
      const mesData = data.get(this.getMonthYearString(index));
      if (mesData) {
        acertosData[index] = mesData.get('acertos') || 0;
        errosData[index] = mesData.get('erros') || 0;
      }
    });

    this.barChartData3 = [
      {
        data: acertosData,
        label: 'Acertos',
        backgroundColor: '#0A275E',
        borderColor: '#0A275E',
        hoverBackgroundColor: '#113A87',
        hoverBorderColor: '#113A87',
      },
      {
        data: errosData,
        label: 'Erros',
        backgroundColor: '#4E5E7B',
        borderColor: '#4E5E7B',
        hoverBackgroundColor: '#667A9F',
        hoverBorderColor: '#667A9F',
      },
    ];
  }

  private convertBackendDataToMap(data: any): Map<string, Map<string, number>> {
    const result = new Map<string, Map<string, number>>();
    Object.keys(data).forEach((key) => {
      const value = data[key];
      const innerMap = new Map<string, number>();
      innerMap.set('acertos', value.acertos);
      innerMap.set('erros', value.erros);
      result.set(key, innerMap);
    });
    return result;
  }

  private getMonthYearString(index: number): string {
    const year = new Date().getFullYear();
    const month = (index + 1).toString().padStart(2, '0');
    return `${month}/${year}`;
  }
}
