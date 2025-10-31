// src/app/mentoria/sugestoes-aluno-dialog/sugestoes-aluno-dialog.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { QuestoesService } from 'src/app/services/questoes.service';
import { SugestaoQuestaoResponseDTO } from '../page-mentoria/SugestaoQuestaoIResponseDTO';
import { Tema } from '../page-questoes/enums/tema';
import { Subtema } from '../page-questoes/enums/subtema';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { SubtemaDescricoes } from '../page-questoes/enums/subtema-descricao';
import { TipoDeProvaDescricoes } from '../page-questoes/enums/tipodeprova-descricao';

interface SugestaoQuestao {
  question_id: number;
  question_text: string;
  theme: string;
  subtheme: string;
  exam_type: string;
}

interface SugestoesAgrupadas {
  tema: string;
  subtema: string;
  tipoDeProva: string;
  questoes: SugestaoQuestao[];
}

@Component({
  selector: 'app-sugestao-aluno-dialog',
  templateUrl: './sugestao-aluno-dialog.component.html',
  styleUrls: ['./sugestao-aluno-dialog.component.css'] 
})
export class SugestaoAlunoDialogComponent implements OnInit {

  sugestoesAgrupadas: SugestoesAgrupadas[] = [];
  carregandoSugestoes = true;
  paginaAtual = 1;
  totalDePaginas = 5; 
  limitePorPagina = 10;
  alunoId: number;
  nomeAluno: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { alunoId: number, nomeAluno: string },
    private readonly questoesService: QuestoesService,
    private readonly router: Router,
    public readonly sanitizer: DomSanitizer
  ) {
    this.alunoId = data.alunoId;
    this.nomeAluno = data.nomeAluno;
  }

  ngOnInit(): void {
    this.fetchPaginaDeSugestoes(this.paginaAtual);
  }

  fetchPaginaDeSugestoes(pagina: number): void {
    this.carregandoSugestoes = true;
    this.sugestoesAgrupadas = [];

    this.questoesService.obterSugestoesDeQuestoes(this.alunoId, pagina, this.limitePorPagina).subscribe({
      next: (resultado: SugestaoQuestaoResponseDTO[] | null) => {
      const sugestoes: SugestaoQuestao[] = resultado ? resultado.reduce((acc: SugestaoQuestao[], dto) => {
        return acc.concat(dto.suggestions.map((suggestion: { question_id: any; question_text: any; theme: any; subtheme: any; exam_type: any; }) => ({
        question_id: suggestion.question_id,
        question_text: suggestion.question_text,
        theme: suggestion.theme,
        subtheme: suggestion.subtheme,
        exam_type: suggestion.exam_type
        })));
      }, []) : [];

        this.agruparSugestoes(sugestoes);
        this.carregandoSugestoes = false;
      },
      error: (error) => {
        console.error(`Erro ao buscar sugestões da página ${pagina} para o aluno ${this.alunoId}:`, error);
        this.sugestoesAgrupadas = [];
        this.carregandoSugestoes = false;
      }
    });
  }

  private agruparSugestoes(sugestoes: SugestaoQuestao[]): void {
    const grupos: { [key: string]: SugestoesAgrupadas } = {};
    for (const questao of sugestoes) {
      const chave = `${questao.theme}-${questao.subtheme}`;
      if (!grupos[chave]) {
        grupos[chave] = {
          tema: questao.theme,
          subtema: questao.subtheme,
          tipoDeProva: questao.exam_type,
          questoes: []
        };
      }
      grupos[chave].questoes.push(questao);
    }
    this.sugestoesAgrupadas = Object.values(grupos);
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalDePaginas || pagina === this.paginaAtual) {
      return;
    }
    this.paginaAtual = pagina;
    this.fetchPaginaDeSugestoes(this.paginaAtual);
  }

  criarSimuladoComFoco(sugestao: SugestoesAgrupadas): void {
    this.router.navigate(['/usuario/simulados'], {
      queryParams: {
        tema: sugestao.tema,
        subtema: sugestao.subtema,
        alunoId: this.alunoId
      }
    });
  }

  // Funções de tradução
  traduzirTema(tema: string): string {
    return TemaDescricoes[tema as Tema] || tema;
  }

  traduzirSubtema(subtema: string): string {
    return SubtemaDescricoes[subtema as Subtema] || subtema;
  }

  traduzirTipoDeProva(tipoDeProva: string): string {
    return TipoDeProvaDescricoes[tipoDeProva as TipoDeProva] || tipoDeProva;
  }
}