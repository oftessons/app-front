import { Component, OnInit } from '@angular/core';
import { AulasService } from 'src/app/services/aulas.service';
import { Aula } from 'src/app/sistema/painel-de-aulas/aula';

@Component({
  selector: 'app-modulo-cirurgia-refrativa',
  templateUrl: './modulo-cirurgia-refrativa.component.html',
  styleUrls: ['./modulo-cirurgia-refrativa.component.css']
})
export class ModuloCirurgiaRefrativaComponent implements OnInit {

  aulas: Aula[] = [];
    categoria: string = 'Cirurgia Refrativa';
  
    constructor(
      private aulasService: AulasService
    ) { }
  
    ngOnInit(): void {
      this.listarAulasPorCategoria(this.categoria);
    }
  
    listarAulasPorCategoria(categoria: string): void {
      console.log('Categoria enviada:', categoria); 
      this.aulasService.listarAulasPorCategoria(categoria).subscribe(
        (data: Aula[]) => {
          console.log('Aulas recebidas:', data); 
          this.aulas = data;
        },
        (error) => {
          console.error('Erro ao listar aulas:', error);
        }
      );
    }

}
