import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ThemeService } from 'src/app/services/theme.service';

export interface FiltroQuestoes {
  tema?: string[];
  subtema?: string[];
  ano?: string[];
  tipoDeProva?: string[];
  dificuldade?: string[];
}

export interface ConteudoSemana {
  semanaNumero: number;
  titulo: string;
  descricao?: string;
  filtrosQuestoesPre: FiltroQuestoes;
  filtrosQuestoesPos: FiltroQuestoes;
  aulasIds?: number[];
  flashcardsIds?: number[];
}

@Component({
  selector: 'app-modal-editar-semana-trilha',
  templateUrl: './modal-editar-semana-trilha.component.html',
  styleUrls: ['./modal-editar-semana-trilha.component.css']
})
export class ModalEditarSemanaTrilhaComponent implements OnInit {
  semanaNumero: number;
  titulo: string = '';
  descricao: string = '';
  
  abaAtiva: 'questoes-pre' | 'aulas' | 'questoes-pos' | 'flashcards' = 'questoes-pre';
  
  multSelectTemasPre: string[] = [];
  multSelectSubtemasPre: string[] = [];
  multSelectAnosPre: string[] = [];
  multSelectTiposProvaPre: string[] = [];
  multSelectDificuldadesPre: string[] = [];
  
  multSelectTemasPos: string[] = [];
  multSelectSubtemasPos: string[] = [];
  multSelectAnosPos: string[] = [];
  multSelectTiposProvaPos: string[] = [];
  multSelectDificuldadesPos: string[] = [];
  
  temasDescricoes: any[] = [
    { label: 'Catarata', value: 'Catarata' },
    { label: 'Glaucoma', value: 'Glaucoma' },
    { label: 'Retina', value: 'Retina' },
    { label: 'Córnea', value: 'Córnea' },
    { label: 'Refrativa', value: 'Refrativa' },
    { label: 'Estrabismo', value: 'Estrabismo' },
    { label: 'Plástica Ocular', value: 'Plástica Ocular' },
    { label: 'Órbita', value: 'Órbita' },
    { label: 'Vias Lacrimais', value: 'Vias Lacrimais' }
  ];
  
  anosDescricoes: any[] = [
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' },
    { label: '2020', value: '2020' },
    { label: '2019', value: '2019' },
    { label: '2018', value: '2018' }
  ];
  
  tiposDeProvaDescricoes: any[] = [
    { label: 'Prova de Especialidades (Teórica 2)', value: 'Prova de Especialidades (Teórica 2)' },
    { label: 'Prova Geral (Teórica 1)', value: 'Prova Geral (Teórica 1)' },
    { label: 'Prova Prática', value: 'Prova Prática' }
  ];
  
  dificuldadesDescricoes: any[] = [
    { label: 'Fácil', value: 'Fácil' },
    { label: 'Médio', value: 'Médio' },
    { label: 'Difícil', value: 'Difícil' }
  ];

  constructor(
    public dialogRef: MatDialogRef<ModalEditarSemanaTrilhaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConteudoSemana,
    private themeService: ThemeService
  ) {
    this.semanaNumero = data.semanaNumero;
    this.titulo = data.titulo || '';
    this.descricao = data.descricao || '';
    
    this.multSelectTemasPre = data.filtrosQuestoesPre?.tema || [];
    this.multSelectSubtemasPre = data.filtrosQuestoesPre?.subtema || [];
    this.multSelectAnosPre = data.filtrosQuestoesPre?.ano || [];
    this.multSelectTiposProvaPre = data.filtrosQuestoesPre?.tipoDeProva || [];
    this.multSelectDificuldadesPre = data.filtrosQuestoesPre?.dificuldade || [];
    
    this.multSelectTemasPos = data.filtrosQuestoesPos?.tema || [];
    this.multSelectSubtemasPos = data.filtrosQuestoesPos?.subtema || [];
    this.multSelectAnosPos = data.filtrosQuestoesPos?.ano || [];
    this.multSelectTiposProvaPos = data.filtrosQuestoesPos?.tipoDeProva || [];
    this.multSelectDificuldadesPos = data.filtrosQuestoesPos?.dificuldade || [];
  }

  ngOnInit(): void {
  }

  trocarAba(aba: 'questoes-pre' | 'aulas' | 'questoes-pos' | 'flashcards'): void {
    this.abaAtiva = aba;
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  getFiltrosAtivos(tipo: 'pre' | 'pos'): string {
    let count = 0;
    
    if (tipo === 'pre') {
      count += this.multSelectTemasPre.length;
      count += this.multSelectSubtemasPre.length;
      count += this.multSelectAnosPre.length;
      count += this.multSelectTiposProvaPre.length;
      count += this.multSelectDificuldadesPre.length;
    } else {
      count += this.multSelectTemasPos.length;
      count += this.multSelectSubtemasPos.length;
      count += this.multSelectAnosPos.length;
      count += this.multSelectTiposProvaPos.length;
      count += this.multSelectDificuldadesPos.length;
    }
    
    return count > 0 ? `${count} filtro(s) aplicado(s)` : 'Nenhum filtro aplicado';
  }

  limparFiltros(tipo: 'pre' | 'pos'): void {
    if (tipo === 'pre') {
      this.multSelectTemasPre = [];
      this.multSelectSubtemasPre = [];
      this.multSelectAnosPre = [];
      this.multSelectTiposProvaPre = [];
      this.multSelectDificuldadesPre = [];
    } else {
      this.multSelectTemasPos = [];
      this.multSelectSubtemasPos = [];
      this.multSelectAnosPos = [];
      this.multSelectTiposProvaPos = [];
      this.multSelectDificuldadesPos = [];
    }
  }

  salvar(): void {
    const resultado: ConteudoSemana = {
      semanaNumero: this.semanaNumero,
      titulo: this.titulo,
      descricao: this.descricao,
      filtrosQuestoesPre: {
        tema: this.multSelectTemasPre,
        subtema: this.multSelectSubtemasPre,
        ano: this.multSelectAnosPre,
        tipoDeProva: this.multSelectTiposProvaPre,
        dificuldade: this.multSelectDificuldadesPre
      },
      filtrosQuestoesPos: {
        tema: this.multSelectTemasPos,
        subtema: this.multSelectSubtemasPos,
        ano: this.multSelectAnosPos,
        tipoDeProva: this.multSelectTiposProvaPos,
        dificuldade: this.multSelectDificuldadesPos
      }
    };
    
    this.dialogRef.close(resultado);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
