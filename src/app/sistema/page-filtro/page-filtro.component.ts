import { Component, OnInit } from '@angular/core';
import { Filtro } from '../filtro';
import { FiltroService } from 'src/app/services/filtro.service';


@Component({
  selector: 'app-page-filtro',
  templateUrl: './page-filtro.component.html',
  styleUrls: ['./page-filtro.component.css']
})
export class PageFiltroComponent implements OnInit {

  filtros: Filtro[] = [];

  constructor(private filtroService: FiltroService) { }

  ngOnInit(): void {
    this.carregarFiltros();
  }

  carregarFiltros(): void {
    this.filtroService.getFiltros()
      .subscribe(
        filtros => {
          this.filtros = filtros;
        },
        error => {
          console.error('Erro ao carregar filtros:', error);
          // Tratar erro aqui se necessário
        }
      );
  }

  deletarFiltro(id: number): void {
    this.filtroService.deletarFiltro(id)
      .subscribe(
        () => {
          // Após deletar com sucesso, recarregar os filtros
          this.carregarFiltros();
        },
        error => {
          console.error('Erro ao deletar filtro:', error);
          // Tratar erro aqui se necessário
        }
      );
  }

}
