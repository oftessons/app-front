import { Component, OnInit } from '@angular/core';
import { AulasService } from 'src/app/services/aulas.service';
import { Aula } from 'src/app/sistema/painel-de-aulas/aula';

@Component({
  selector: 'app-modulo-catarata',
  templateUrl: './modulo-catarata.component.html',
  styleUrls: ['./modulo-catarata.component.css']
})
export class ModuloCatarataComponent implements OnInit {
  aulas: Aula[] = [];
  categoria: string = 'Catarata';

  constructor(
    private aulasService: AulasService
  ) { }

  ngOnInit(): void {
    this.listarAulasPorCategoria(this.categoria);
  }

  listarAulasPorCategoria(categoria: string): void {
    this.aulasService.listarAulasPorCategoria(categoria).subscribe(
      (data: Aula[]) => {
        this.aulas = data;
      },
      (error) => {
        console.error('Erro ao listar aulas:', error);
      }
    );
  }

}
