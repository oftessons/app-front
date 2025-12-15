import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Chart from 'chart.js'; 

@Component({
  selector: 'app-dialog-resultado-simulado',
  templateUrl: './dialog-resultado-simulado.component.html',
  styleUrls: ['./dialog-resultado-simulado.component.css']
})
export class DialogResultadoSimuladoComponent implements OnInit {
  chart: any;
  acertos: number = 0;
  erros: number = 0;
  totalQuestoes: number = 0;
  tempoTotal: number = 0;
  porcentagemAcertos: number = 0;

  constructor(
    public dialogRef: MatDialogRef<DialogResultadoSimuladoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.acertos = data.acertos;
    this.erros = data.erros;
    this.totalQuestoes = data.totalQuestoes;
    this.tempoTotal = data.tempoDecorrido;
  }

  ngOnInit(): void {
    this.calcularPorcentagem();
    setTimeout(() => this.gerarGrafico(), 100);
  }

  calcularPorcentagem() {
    if (this.totalQuestoes > 0) {
      this.porcentagemAcertos = Math.round((this.acertos / this.totalQuestoes) * 100);
    }
  }

  gerarGrafico() {
    if (this.chart) this.chart.destroy();

    this.chart = new Chart('graficoDialogResultado', {
      type: 'doughnut',
      data: {
        labels: ['Acertos', 'Erros'],
        datasets: [{
          data: [this.acertos, this.erros],
          backgroundColor: ['#48bb78', '#f56565'],
          borderWidth: 0,
          hoverBackgroundColor: ['#38a169', '#c53030']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutoutPercentage: 75,
        legend: { display: false },
        tooltips: { enabled: true }
      }
    });
  }

  formatarTempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    const format = (num: number) => num < 10 ? `0${num}` : `${num}`;
    return `${format(horas)}:${format(minutos)}:${format(segs)}`;
  }

  fechar() {
    this.dialogRef.close();
  }
}