import { Component, ElementRef, HostListener, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { QuestoesService } from 'src/app/services/questoes.service'; 
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

interface TemaData {
  nome: string;
  valor: number;
  selecionado: boolean;
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

  
  public totalQuestoesGeral: number = 0;
  public temaDestaque: string = '---';
  public questoesDestaque: number = 0;
  public showRadarConfig: boolean = false; 
  public todosTemas: TemaData[] = [];
  public maxTemasPermitidos: number = 10;
  public radarChartType: ChartType = 'radar';


  public showConfigAcertos: boolean = false;
  public showConfigErros: boolean = false;
  public todosTemasAcertos: TemaData[] = [];
  public todosTemasErros: TemaData[] = [];
  public radarAcertosLabels: Label[] = [];
  public radarAcertosData: ChartDataSets[] = [];
  public radarErrosLabels: Label[] = [];
  public radarErrosData: ChartDataSets[] = [];
  public totalAcertosCard: number = 0;
  public totalErrosCard: number = 0;
  public pctAcertosCard: number = 0;
  public pctErrosCard: number = 0;
  public larguraTela: number = window.innerWidth;




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



  public radarChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    title: { display: false },
    legend: { display: false }, 
    scale: {
      angleLines: {
        color: 'rgba(255, 255, 255, 0.1)' 
      },
      gridLines: {
        color: 'rgba(255, 255, 255, 0.1)' 
      },
      pointLabels: {
        fontColor: '#ffffff', 
        fontSize: 12
      },
      ticks: {
        backdropColor: 'transparent', 
        fontColor: '#94a3b8',
        beginAtZero: true,
        showLabelBackdrop: false
      }
    },
    tooltips: {
      backgroundColor: '#1e293b',
      titleFontColor: '#fff',
      bodyFontColor: '#fff',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1
    }
  };
  public radarChartLabels: Label[] = [];
  public radarChartData: ChartDataSets[] = [
    { data: [], label: 'Questões' }
  ];



  
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
          fontColor: '#94a3b8', 
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
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.larguraTela = window.innerWidth;
    this.verificarResolucaoEAtualizar(true);
  }

  private verificarResolucaoEAtualizar(forcarAtualizacaoGraficos: boolean): void {
    
    const limiteAnterior = this.maxTemasPermitidos;
    const isMobile = this.larguraTela < 900; 

    this.maxTemasPermitidos = isMobile ? 5 : 10;

    
    if (limiteAnterior !== this.maxTemasPermitidos || forcarAtualizacaoGraficos) {
      
      
      this.reaplicarLimiteSelecao(this.todosTemas);
      this.atualizarGraficoRadar();

      
      this.reaplicarLimiteSelecao(this.todosTemasAcertos);
      this.atualizarRadarVisual('acertos');

      this.reaplicarLimiteSelecao(this.todosTemasErros);
      this.atualizarRadarVisual('erros');
    }
  }

  
  private processChartData1(data: any): void {
    const provas = [
      'Prova de Bases (Teórica 1)',
      'Prova de Especialidades (Teórica 2)',
      'Prova de Imagens (Teórico-prática)',
    ];

    
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
          cutoutPercentage: 55, 
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              fontColor: '#ffffff', 
              usePointStyle: true, 
              padding: 20
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

  
  private processChartData2(data: any): void {
    const nomes = Object.keys(data);
    
    this.todosTemas = nomes.map(nome => {
      return {
        nome: nome,
        valor: data[nome] || 0,
        selecionado: false,
      };
    });

    this.todosTemas.sort((a, b) => b.valor - a.valor);

    this.todosTemas.forEach((tema, index) => {
      if (index < 10) {
        tema.selecionado = true;
      }
    });

    this.atualizarTotaisGerais();

    this.atualizarGraficoRadar();
  }


  public toggleTema(tema: TemaData): void {
    const totalSelecionados = this.todosTemas.filter(t => t.selecionado).length;
    if (!tema.selecionado && totalSelecionados >= this.maxTemasPermitidos) {
      alert(`Você só pode selecionar no máximo ${this.maxTemasPermitidos} temas.`);
      return;
    }
    tema.selecionado = !tema.selecionado;
    
    this.atualizarGraficoRadar();
  }

  private atualizarGraficoRadar(): void {
    let ativos = [...this.todosTemas.filter(t => t.selecionado)];
    ativos.sort((a, b) => a.nome.localeCompare(b.nome)); 
    this.radarChartLabels = ativos.map(t => this.quebrarTextoEmLinhas(t.nome));
    
    this.radarChartData = [{
      data: ativos.map(t => t.valor),
      label: 'Questões Feitas',
      backgroundColor: 'rgba(214, 156, 17, 0.2)',
      borderColor: '#D69C11',
      pointBackgroundColor: '#D69C11',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#D69C11',
      borderWidth: 2
    }];
  }

  private atualizarTotaisGerais(): void {
    const valores = this.todosTemas.map(t => t.valor);
    this.totalQuestoesGeral = valores.reduce((a, b) => a + b, 0);

    if (this.todosTemas.length > 0) {
      this.temaDestaque = this.todosTemas[0].nome;
      this.questoesDestaque = this.todosTemas[0].valor;
    }
  }

  public toggleConfig(): void {
    this.showRadarConfig = !this.showRadarConfig;
  }

  @ViewChild('modalConfig') modalConfig!: ElementRef;
  @ViewChild('btnConfig') btnConfig!: ElementRef;

  @ViewChild('modalConfigAcertos') modalConfigAcertos!: ElementRef;
  @ViewChild('btnConfigAcertos') btnConfigAcertos!: ElementRef;

  @ViewChild('modalConfigErros') modalConfigErros!: ElementRef;
  @ViewChild('btnConfigErros') btnConfigErros!: ElementRef;


  @HostListener('document:click', ['$event'])
  clickFora(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.showRadarConfig) {
      const clicouNoModal = this.modalConfig && this.modalConfig.nativeElement.contains(target);
      const clicouNoBotao = this.btnConfig && this.btnConfig.nativeElement.contains(target);
      if (!clicouNoModal && !clicouNoBotao) {
        this.showRadarConfig = false;
      }
    }

    if (this.showConfigAcertos) {
      const clicouNoModal = this.modalConfigAcertos && this.modalConfigAcertos.nativeElement.contains(target);
      const clicouNoBotao = this.btnConfigAcertos && this.btnConfigAcertos.nativeElement.contains(target);
      if (!clicouNoModal && !clicouNoBotao) {
        this.showConfigAcertos = false;
      }
    }

    if (this.showConfigErros) {
      const clicouNoModal = this.modalConfigErros && this.modalConfigErros.nativeElement.contains(target);
      const clicouNoBotao = this.btnConfigErros && this.btnConfigErros.nativeElement.contains(target);
      if (!clicouNoModal && !clicouNoBotao) {
        this.showConfigErros = false;
      }
    }
  }


  private processChartData4(data: any): void {
    const temas = Object.values(TemaDescricoes); 
    
    
    this.totalAcertosCard = 0;
    this.totalErrosCard = 0;
    this.todosTemasAcertos = [];
    this.todosTemasErros = [];

    
    temas.forEach(tema => {
      const acertos = data[tema]?.acertos || 0;
      const erros = data[tema]?.erros || 0;

      
      this.totalAcertosCard += acertos;
      this.totalErrosCard += erros;

      
      this.todosTemasAcertos.push({
        nome: tema,
        valor: acertos,
        selecionado: false 
      });

      
      this.todosTemasErros.push({
        nome: tema,
        valor: erros,
        selecionado: false
      });
    });

    
    const totalGeral = this.totalAcertosCard + this.totalErrosCard;
    this.pctAcertosCard = totalGeral > 0 ? Math.round((this.totalAcertosCard / totalGeral) * 100) : 0;
    this.pctErrosCard = totalGeral > 0 ? Math.round((this.totalErrosCard / totalGeral) * 100) : 0;

    
    this.prepararDadosRadar(this.todosTemasAcertos, 'acertos');
    this.prepararDadosRadar(this.todosTemasErros, 'erros');
  }

  
  private prepararDadosRadar(lista: TemaData[], tipo: 'acertos' | 'erros'): void {
    lista.sort((a, b) => b.valor - a.valor);
    this.reaplicarLimiteSelecao(lista);
    this.atualizarRadarVisual(tipo);
  }

  
  public atualizarRadarVisual(tipo: 'acertos' | 'erros'): void {
    const lista = tipo === 'acertos' ? this.todosTemasAcertos : this.todosTemasErros;
    
    let ativos = [...lista.filter(t => t.selecionado)];
    ativos.sort((a, b) => a.nome.localeCompare(b.nome));

    const corFundo = tipo === 'acertos' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    const corBorda = tipo === 'acertos' ? '#3B82F6' : '#EF4444'; 

    const dataset = [{
      data: ativos.map(t => t.valor),
      label: tipo === 'acertos' ? 'Acertos' : 'Erros',
      backgroundColor: corFundo,
      borderColor: corBorda,
      pointBackgroundColor: corBorda,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: corBorda,
      borderWidth: 2
    }];

    const labels = ativos.map(t => this.quebrarTextoEmLinhas(t.nome));

    if (tipo === 'acertos') {
      this.radarAcertosData = dataset;
      this.radarAcertosLabels = labels; 
    } else {
      this.radarErrosData = dataset;
      this.radarErrosLabels = labels;
    }
  }


  public toggleConfigAcertos() { this.showConfigAcertos = !this.showConfigAcertos; }
  public toggleConfigErros() { this.showConfigErros = !this.showConfigErros; }


  public toggleTemaEspecifico(item: TemaData, tipo: 'acertos' | 'erros') {
    
    const lista = tipo === 'acertos' ? this.todosTemasAcertos : this.todosTemasErros;
    const totalSelecionados = lista.filter(t => t.selecionado).length;
    if (!item.selecionado && totalSelecionados >= this.maxTemasPermitidos) {
      alert(`Você só pode selecionar no máximo ${this.maxTemasPermitidos} temas para visualizar.`);
      return; 
    }
    item.selecionado = !item.selecionado;
    this.atualizarRadarVisual(tipo);
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
        lineTension: 0.2, 
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

        fill: false,
        lineTension: 0.2,
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

  private reaplicarLimiteSelecao(lista: TemaData[]): void {
    
    lista.sort((a, b) => b.valor - a.valor);
    
    lista.forEach((item, index) => {
      
      item.selecionado = index < this.maxTemasPermitidos;
    });
  }
  
  private quebrarTextoEmLinhas(texto: string): string | string[] {
    const limiteCaracteres = 15; 
    
    if (texto.length <= limiteCaracteres) {
      return texto;
    }

    const palavras = texto.split(' ');
    const linhas: string[] = [];
    let linhaAtual = palavras[0];

    for (let i = 1; i < palavras.length; i++) {
      if (linhaAtual.length + 1 + palavras[i].length <= limiteCaracteres) {
        linhaAtual += ' ' + palavras[i];
      } else {
        linhas.push(linhaAtual);
        linhaAtual = palavras[i];
      }
    }
    linhas.push(linhaAtual);
    
    return linhas; 
  }
}
