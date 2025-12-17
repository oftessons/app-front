import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ThemeService } from 'src/app/services/theme.service';
import { AulasService } from 'src/app/services/aulas.service';
import { Aula } from 'src/app/sistema/painel-de-aulas/aula';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, takeUntil } from 'rxjs/operators';
import { CertasErradas } from 'src/app/sistema/page-questoes/enums/certas-erradas';
import { RespostasSimulado } from 'src/app/sistema/page-questoes/enums/resp-simu';
import { Comentada } from 'src/app/sistema/page-questoes/enums/comentadas';
import { Tema } from 'src/app/sistema/page-questoes/enums/tema';
import { Subtema } from 'src/app/sistema/page-questoes/enums/subtema';
import { temasESubtemas } from 'src/app/sistema/page-questoes/enums/map-tema-subtema';
import { 
  getDescricaoCertoErrado, 
  getDescricaoRespostasSimulado, 
  getDescricaoQuestaoComentadas,
  getDescricaoTema,
  getDescricaoSubtema
} from 'src/app/sistema/page-questoes/enums/enum-utils';

export interface FiltroQuestoes {
  assunto?: (Subtema | string)[];
  ano?: string[];
  tipoDeProva?: string[];
  dificuldade?: string[];
  certasErradas?: string[];
  respostasSimulado?: string[];
  comentada?: string[];
  palavraChave?: string;
  quantidadeQuestoes?: number;
}

export interface ConteudoSemana {
  semanaNumero: number;
  titulo: string;
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
export class ModalEditarSemanaTrilhaComponent implements OnInit, OnDestroy {
  semanaNumero: number;
  titulo: string = '';
  
  abaAtiva: 'questoes-pre' | 'aulas' | 'questoes-pos' | 'flashcards' = 'questoes-pre';
  
  // Filtros Pré-Teste
  multSelectAssuntoPre: (Subtema | string)[] = [];
  multSelectAnosPre: string[] = [];
  multSelectTiposProvaPre: string[] = [];
  multSelectDificuldadesPre: string[] = [];
  multSelectQuestoesPre: string[] = [];
  multSelectRespostasPre: string[] = [];
  multSelectComentariosPre: string[] = [];
  palavraChavePre: string = '';
  quantidadeQuestoesPre: string = '';
  
  // Filtros Pós-Teste
  multSelectAssuntoPos: (Subtema | string)[] = [];
  multSelectAnosPos: string[] = [];
  multSelectTiposProvaPos: string[] = [];
  multSelectDificuldadesPos: string[] = [];
  multSelectQuestoesPos: string[] = [];
  multSelectRespostasPos: string[] = [];
  multSelectComentariosPos: string[] = [];
  palavraChavePos: string = '';
  quantidadeQuestoesPos: string = '';
  
  aulasDisponiveis: Aula[] = [];
  aulasSelecionadas: number[] = [];
  carregandoAulas: boolean = false;
  erroCarregarAulas: string = '';
  pesquisaAula: string = '';
  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  subtemasAgrupadosPorTema: {
    label: string;
    value: string;
    options: { label: string; value: Subtema }[];
  }[] = [];
  
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

  questoesCertasErradas: any[] = [];
  respSimuladoDescricoes: any[] = [];
  questoesComentadas: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ModalEditarSemanaTrilhaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConteudoSemana,
    private themeService: ThemeService,
    private aulasService: AulasService
  ) {
    this.semanaNumero = data.semanaNumero;
    this.titulo = data.titulo || '';
    
    // Pré-Teste
    this.multSelectAssuntoPre = data.filtrosQuestoesPre?.assunto || [];
    this.multSelectAnosPre = data.filtrosQuestoesPre?.ano || [];
    this.multSelectTiposProvaPre = data.filtrosQuestoesPre?.tipoDeProva || [];
    this.multSelectDificuldadesPre = data.filtrosQuestoesPre?.dificuldade || [];
    this.multSelectQuestoesPre = data.filtrosQuestoesPre?.certasErradas || [];
    this.multSelectRespostasPre = data.filtrosQuestoesPre?.respostasSimulado || [];
    this.multSelectComentariosPre = data.filtrosQuestoesPre?.comentada || [];
    this.palavraChavePre = data.filtrosQuestoesPre?.palavraChave || '';
    this.quantidadeQuestoesPre = data.filtrosQuestoesPre?.quantidadeQuestoes ? String(data.filtrosQuestoesPre.quantidadeQuestoes) : '';
    
    // Pós-Teste
    this.multSelectAssuntoPos = data.filtrosQuestoesPos?.assunto || [];
    this.multSelectAnosPos = data.filtrosQuestoesPos?.ano || [];
    this.multSelectTiposProvaPos = data.filtrosQuestoesPos?.tipoDeProva || [];
    this.multSelectDificuldadesPos = data.filtrosQuestoesPos?.dificuldade || [];
    this.multSelectQuestoesPos = data.filtrosQuestoesPos?.certasErradas || [];
    this.multSelectRespostasPos = data.filtrosQuestoesPos?.respostasSimulado || [];
    this.multSelectComentariosPos = data.filtrosQuestoesPos?.comentada || [];
    this.palavraChavePos = data.filtrosQuestoesPos?.palavraChave || '';
    this.quantidadeQuestoesPos = data.filtrosQuestoesPos?.quantidadeQuestoes ? String(data.filtrosQuestoesPos.quantidadeQuestoes) : '';
    
    this.aulasSelecionadas = data.aulasIds || [];
    
    // Inicializar opções dos filtros
    this.inicializarOpcoesFiltros();
  }

  ngOnInit(): void {
    this.carregarAulas();
    this.configurarPesquisa();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  configurarPesquisa(): void {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.carregandoAulas = true),
      switchMap((term: string) => {
        if (!term || term.length < 2) {
          this.carregandoAulas = false;
          return [];
        }
        return this.aulasService.pesquisarAulasPorTitulo(term).pipe(
          finalize(() => this.carregandoAulas = false)
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (resultados) => {
        this.aulasDisponiveis = resultados.map(r => ({
          id: parseInt(r.id),
          titulo: r.titulo,
          descricao: r.subtitulo,
          categoria: r.tipo,
          poster: r.thumbnailUrl
        } as any));
        this.carregandoAulas = false;
      },
      error: (erro) => {
        console.error('Erro ao pesquisar aulas:', erro);
        this.erroCarregarAulas = 'Erro ao pesquisar aulas.';
        this.carregandoAulas = false;
      }
    });
  }

  inicializarOpcoesFiltros(): void {
    // Assuntos (Temas e Subtemas agrupados)
    this.subtemasAgrupadosPorTema = Object.entries(temasESubtemas)
      .map(([temaKey, subtemas]) => {
        const temaEnum = temaKey as Tema;
        return {
          label: getDescricaoTema(temaEnum),
          value: `TEMA_${temaEnum}`,
          options: subtemas.map(subtema => ({
            label: getDescricaoSubtema(subtema),
            value: subtema
          }))
        };
      });

    // Questões Certas/Erradas
    const certoErrado = Object.values(CertasErradas);
    this.questoesCertasErradas = certoErrado.map((valor) => ({
      label: getDescricaoCertoErrado(valor),
      value: getDescricaoCertoErrado(valor)
    }));

    // Respostas Simulado
    const respSimulado = Object.values(RespostasSimulado);
    this.respSimuladoDescricoes = respSimulado.map((valor) => ({
      label: getDescricaoRespostasSimulado(valor),
      value: getDescricaoRespostasSimulado(valor)
    }));

    // Questões Comentadas
    const comentadas = Object.values(Comentada);
    this.questoesComentadas = comentadas.map((valor) => ({
      label: getDescricaoQuestaoComentadas(valor),
      value: getDescricaoQuestaoComentadas(valor)
    }));
  }

  trocarAba(aba: 'questoes-pre' | 'aulas' | 'questoes-pos' | 'flashcards'): void {
    this.abaAtiva = aba;
  }

  carregarAulas(): void {
    this.carregandoAulas = true;
    this.erroCarregarAulas = '';

    this.aulasService.listarTodasAulas().subscribe({
      next: (aulas) => {
        this.aulasDisponiveis = aulas;
        this.carregandoAulas = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar aulas:', erro);
        this.erroCarregarAulas = 'Não foi possível carregar as aulas. Tente novamente.';
        this.carregandoAulas = false;
      }
    });
  }

  get aulasFiltradas(): Aula[] {
    return this.aulasDisponiveis;
  }

  onPesquisaChange(termo: string): void {
    this.pesquisaAula = termo;
    if (!termo || termo.length < 2) {
      this.carregarAulas();
      return;
    }
    this.searchTerms.next(termo);
  }

  toggleAulaSelecionada(aulaId: number): void {
    const index = this.aulasSelecionadas.indexOf(aulaId);
    if (index === -1) {
      this.aulasSelecionadas.push(aulaId);
    } else {
      this.aulasSelecionadas.splice(index, 1);
    }
  }

  isAulaSelecionada(aulaId: number): boolean {
    return this.aulasSelecionadas.includes(aulaId);
  }

  limparSelecaoAulas(): void {
    this.aulasSelecionadas = [];
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  getFiltrosAtivos(tipo: 'pre' | 'pos'): string {
    let count = 0;
    
    if (tipo === 'pre') {
      count += this.multSelectAssuntoPre.length;
      count += this.multSelectAnosPre.length;
      count += this.multSelectTiposProvaPre.length;
      count += this.multSelectDificuldadesPre.length;
      count += this.multSelectQuestoesPre.length;
      count += this.multSelectRespostasPre.length;
      count += this.multSelectComentariosPre.length;
      if (this.palavraChavePre) count++;
      if (this.quantidadeQuestoesPre) count++;
    } else {
      count += this.multSelectAssuntoPos.length;
      count += this.multSelectAnosPos.length;
      count += this.multSelectTiposProvaPos.length;
      count += this.multSelectDificuldadesPos.length;
      count += this.multSelectQuestoesPos.length;
      count += this.multSelectRespostasPos.length;
      count += this.multSelectComentariosPos.length;
      if (this.palavraChavePos) count++;
      if (this.quantidadeQuestoesPos) count++;
    }
    
    return count > 0 ? `${count} filtro(s) aplicado(s)` : 'Nenhum filtro aplicado';
  }

  limparFiltros(tipo: 'pre' | 'pos'): void {
    if (tipo === 'pre') {
      this.multSelectAssuntoPre = [];
      this.multSelectAnosPre = [];
      this.multSelectTiposProvaPre = [];
      this.multSelectDificuldadesPre = [];
      this.multSelectQuestoesPre = [];
      this.multSelectRespostasPre = [];
      this.multSelectComentariosPre = [];
      this.palavraChavePre = '';
      this.quantidadeQuestoesPre = '';
    } else {
      this.multSelectAssuntoPos = [];
      this.multSelectAnosPos = [];
      this.multSelectTiposProvaPos = [];
      this.multSelectDificuldadesPos = [];
      this.multSelectQuestoesPos = [];
      this.multSelectRespostasPos = [];
      this.multSelectComentariosPos = [];
      this.palavraChavePos = '';
      this.quantidadeQuestoesPos = '';
    }
  }

  salvar(): void {
    const resultado: ConteudoSemana = {
      semanaNumero: this.semanaNumero,
      titulo: this.titulo,
      filtrosQuestoesPre: {
        assunto: this.multSelectAssuntoPre,
        ano: this.multSelectAnosPre,
        tipoDeProva: this.multSelectTiposProvaPre,
        dificuldade: this.multSelectDificuldadesPre,
        certasErradas: this.multSelectQuestoesPre,
        respostasSimulado: this.multSelectRespostasPre,
        comentada: this.multSelectComentariosPre,
        palavraChave: this.palavraChavePre || undefined,
        quantidadeQuestoes: this.quantidadeQuestoesPre ? parseInt(this.quantidadeQuestoesPre, 10) : undefined
      },
      filtrosQuestoesPos: {
        assunto: this.multSelectAssuntoPos,
        ano: this.multSelectAnosPos,
        tipoDeProva: this.multSelectTiposProvaPos,
        dificuldade: this.multSelectDificuldadesPos,
        certasErradas: this.multSelectQuestoesPos,
        respostasSimulado: this.multSelectRespostasPos,
        comentada: this.multSelectComentariosPos,
        palavraChave: this.palavraChavePos || undefined,
        quantidadeQuestoes: this.quantidadeQuestoesPos ? parseInt(this.quantidadeQuestoesPos, 10) : undefined
      },
      aulasIds: this.aulasSelecionadas,
      flashcardsIds: this.data.flashcardsIds || []
    };
    
    this.dialogRef.close(resultado);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
