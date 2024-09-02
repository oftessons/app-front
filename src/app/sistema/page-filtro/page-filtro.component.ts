import { Component, OnInit } from '@angular/core';
import { FiltroDTO } from '../filtroDTO'; // Atualize o caminho conforme necessário
import { FiltroService } from 'src/app/services/filtro.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-filtro',
  templateUrl: './page-filtro.component.html',
  styleUrls: ['./page-filtro.component.css']
})
export class PageFiltroComponent implements OnInit {
  filtros: FiltroDTO[] = [];

  constructor(
    private filtroService: FiltroService,
    private router: Router
  ) { }

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
        }
      );
  }

  deletarFiltro(id: number): void {
    this.filtroService.deletarFiltro(id)
      .subscribe(
        () => {
          this.carregarFiltros();
        },
        error => {
          console.error('Erro ao deletar filtro:', error);
        }
      );
  }

  editarFiltro(id: number): void {
    this.router.navigate(['/editar-filtro', id]); // Navega para a rota de edição
  }
}
