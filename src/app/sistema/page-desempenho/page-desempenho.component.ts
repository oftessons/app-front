import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { QuestoesService } from 'src/app/services/questoes.service'; // Atualize o caminho se necessário
import { Label, Color } from 'ng2-charts';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/login/usuario';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface PieChartDataCustom {
  title: string;
  data: number[];
  labels: Label[];
  chartType: ChartType;
  options: ChartOptions;
  colors: Color[];
  percentualValor: number;
  percentualTexto: string;
}


@Component({
  selector: 'app-page-desempenho',
  templateUrl: './page-desempenho.component.html',
  styleUrls: ['./page-desempenho.component.css'],
})
export class PageDesempenhoComponent implements OnInit {
  usuario!: Usuario;
  alunoMentoradoId!: string;
  nomeAlunoMentorado!: string;

  public pieChartsData: PieChartDataCustom[] = [];
  public lineChartType: ChartType = 'line';
  public anoAtual = new Date().getFullYear();
  public totalQuestoesAno: number = 0;

  public barChartLabels1: Label[] = [];
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = true;
  public barChartData1: ChartDataSets[] = [
    {
      data: [],
      label: 'Acertos',
      backgroundColor: '#3B82F6',
      borderColor: '#1C9212',
    },
    {
      data: [],
      label: 'Erros',
      backgroundColor: '#EF4444',
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
            stepSize: 1,
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
 
  public barChartOptions3: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    title: { display: false },
    legend: {
      display: true,
      position: 'top',
      align: 'end', 
      labels: {
        fontColor: '#cbd5e1', 
        usePointStyle: true,  
        boxWidth: 8,          
        padding: 20
      }
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    },
    tooltips: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#1e293b', 
      titleFontColor: '#fff',
      bodyFontColor: '#cbd5e1',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1
    },
    scales: {
      xAxes: [{
        gridLines: {
          display: false, 
          drawBorder: false,
        },
        ticks: {
          fontColor: '#94a3b8', 
          padding: 15           
        }
      }],
      yAxes: [{
        position: 'right',
        gridLines: {
          color: 'rgba(255, 255, 255, 0.08)', 
          drawBorder: false, 
          zeroLineColor: 'rgba(255, 255, 255, 0.08)'
        },
        ticks: {
          fontColor: '#94a3b8', // Cor dos números
          beginAtZero: true,
          padding: 15,
          stepSize: 100 
        }
      }]
    }
  };
  public barChartType3: ChartType = 'bar';
  public barChartLabels3: string[] = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
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
    private authService: AuthService,
    @Optional() public dialogRef: MatDialogRef<PageDesempenhoComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { alunoId: string, nomeAluno: string } | null
  ) {
    if (data?.alunoId) {
      this.alunoMentoradoId = data.alunoId;
      this.nomeAlunoMentorado = data.nomeAluno;
    }
  }

  ngOnInit(): void {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        this.usuario = data;

        if (this.alunoMentoradoId) {
          this.usuario.id = this.alunoMentoradoId;
        }

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

  //gráfico de acerto e erro por prova
  private processChartData1(data: any): void {
    const provas = [
      'Prova de Bases (Teórica 1)',
      'Prova de Especialidades (Teórica 2)',
      'Prova de Imagens (Teórico-prática)',
    ];

    // @ts-ignore (ignorando erro de tipagem estrita no map se necessário)
    this.pieChartsData = provas.map((tipo) => {
      const tipoData = data[tipo] || { acertos: 0, erros: 0 };
      
      const total = tipoData.acertos + tipoData.erros;
      const percentual = total > 0 ? Math.round((tipoData.acertos / total) * 100) : 0;

      return {
        title: tipo,
        data: [tipoData.acertos, tipoData.erros],
        labels: ['Acertos', 'Erros'],
        
        chartType: 'doughnut',

        percentualValor: percentual,
        percentualTexto: 'Acertos',

        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutoutPercentage: 60, 
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              fontColor: '#ffffff', 
              usePointStyle: true, 
              padding: 30
            }
          },
          tooltips: {
            enabled: true 
          }
        },
        colors: [
          {
            backgroundColor: ['#3b82f6', '#ef4444'], 
            borderWidth: 1, 
            borderColor: '#F6F8FE' 
          },
        ],
      };
    });
  }


  //gráfico acertos erro por mes
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

    const totalAcertos = acertosData.reduce((a,b) => a+b,0);
    const totalErros = errosData.reduce((a,b) => a+b,0);
    this.totalQuestoesAno = totalAcertos + totalErros;

    this.barChartData3 = [
      {
        data: acertosData,
        label: 'Acertos',
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6', 
        pointRadius: 0,
        pointHitRadius: 10,      
        pointHoverRadius: 6,      
        pointHoverBackgroundColor: '#3B82F6',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        fill: false, 
        lineTension: 0.4, 
        borderWidth: 2
      },
      {
        data: errosData,
        label: 'Erros',
        borderColor: '#EF4444', 
        backgroundColor: '#EF4444',
        pointRadius: 0,
        pointHitRadius: 10,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#EF4444',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        // ------------------------------

        fill: false,
        lineTension: 0.4,
        borderWidth: 2
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

  fecharPopup(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
