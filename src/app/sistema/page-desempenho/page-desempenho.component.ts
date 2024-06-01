import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';

@Component({
  selector: 'app-page-desempenho',
  templateUrl: './page-desempenho.component.html',
  styleUrls: ['./page-desempenho.component.css']
})
export class PageDesempenhoComponent implements OnInit {

  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: string[] = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public barChartData1: ChartDataSets[] = [
    { data: [12, 19, 3, 5, 2, 3], label: 'Series A' },
    { data: [5, 2, 3, 12, 19, 3], label: 'Series B' }
  ];
  
  public barChartData2: ChartDataSets[] = [
    { data: [10, 15, 8, 3, 7, 5], label: 'Series C' },
    { data: [2, 9, 7, 10, 5, 6], label: 'Series D' }
  ];
  
  public pieChartData1: ChartDataSets[] = [
    { data: [12, 19, 3, 5, 2, 3] }
  ];
  
  public pieChartData2: ChartDataSets[] = [
    { data: [10, 15, 8, 3, 7, 5] }
  ];
  

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: string[] = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'];
  public pieChartType: ChartType = 'pie';

  constructor() { }

  ngOnInit(): void {
  }

}
