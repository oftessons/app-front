import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { AnimationOptions } from 'ngx-lottie';
import { ModalTrilhaService, TrilhaData } from 'src/app/services/modal-trilha.service';

@Component({
  selector: 'app-page-trilha',
  templateUrl: './page-trilha.component.html',
  styleUrls: ['./page-trilha.component.css']
})
export class PageTrilhaComponent implements OnInit {
  selectedTema: string = 'Todos os temas';
  expandedNodeIndex: number | null = null;
  selectedNodeIndex: number | null = null;

  temas: string[] = [
    'Todos os temas',
    'Catarata',
    'Lente de Contato',
    'Glaucoma'
  ];

  // Dados das semanas com seus progress cards para teste
  semanas = [
    {
      numero: 1,
      status: 'completed',
      cards: [
        {
          titulo: 'Catarata',
          semana: 'Semana 1',
          status: 'concluido',
          aulas: 2,
          questoes: 20,
          flashcards: 20,
          tempo: '1h30',
          progresso: 100
        },
        {
          titulo: 'Óptica',
          semana: 'Semana 1',
          status: 'concluido',
          aulas: 2,
          questoes: 20,
          flashcards: 20,
          tempo: '1h30',
          progresso: 100
        }
      ]
    },
    { numero: 2, status: 'completed', cards: [
      {
        titulo: 'Catarata',
        semana: 'Semana 2',
        status: 'concluido',
        aulas: 2,
        questoes: 20,
        flashcards: 20,
        tempo: '1h30',
        progresso: 100
      },
      {
        titulo: 'Óptica',
        semana: 'Semana 2',
        status: 'concluido',
        aulas: 2,
        questoes: 20,
        flashcards: 20,
        tempo: '1h30',
        progresso: 100
      }
    ] },
    { numero: 3, status: 'active', cards: [
      {
        titulo: 'Catarata',
        semana: 'Semana 3',
        status: 'nao-iniciado',
        aulas: 2,
        questoes: 1,
        flashcards: 20,
        tempo: '1h30',
        progresso: 0
      }
    ] },
    { numero: 4, status: 'locked', cards: [] },
    { numero: 5, status: 'locked', cards: [] },
    { numero: 6, status: 'locked', cards: [] },
    { numero: 7, status: 'locked', cards: [] },
    { numero: 8, status: 'locked', cards: [] },
    { numero: 9, status: 'locked', cards: [] }
  ];

  eyeAnimationOptions: AnimationOptions = {
    path: 'assets/animations/eye-animation.json',
    loop: true,
    autoplay: true
  };

  eyeLockedOptions: AnimationOptions = {
    path: 'assets/animations/eye-locked.json',
    loop: false,
    autoplay: true,
  };

  eyeCompletedOptions: AnimationOptions = {
    path: 'assets/animations/eye-animation.json',
    loop: false,
    autoplay: false
  };

  eyeProgressOptions: AnimationOptions = {
    path: 'assets/animations/eye-animation.json',
    loop: false,
    autoplay: false
  };

  constructor(
    private themeService: ThemeService,
    private elementRef: ElementRef,
    private modalTrilhaService: ModalTrilhaService
  ) { }

  ngOnInit(): void {
    const initialWeekIndex = this.semanas.findIndex(s => s.status === 'active');
    if (initialWeekIndex !== -1) {
      this.selectedNodeIndex = initialWeekIndex;
    }
  }

  obterOpcoesAnimacao(status: string): AnimationOptions {
    switch (status) {
      case 'concluido':
        return this.eyeCompletedOptions;
      case 'andamento':
        return this.eyeProgressOptions;
      case 'bloqueado':
        return this.eyeLockedOptions;
      default:
        return this.eyeAnimationOptions;
    }
  }

  obterLarguraAnimacao(status: string): string {
    return status === 'bloqueado' ? '45px' : '90px';
  }

  toggleNode(index: number, status: string): void {
    if (status === 'locked') return;
    
    // Para telas grandes (>1530px), atualiza apenas o selectedNodeIndex
    // Para telas pequenas (<1530px), controla o expandedNodeIndex também
    
    if (this.expandedNodeIndex === index) {
      this.expandedNodeIndex = null;
    } else {
      this.expandedNodeIndex = index;
    }

    this.selectedNodeIndex = index;
  }

  isNodeExpanded(index: number): boolean {
    return this.expandedNodeIndex === index;
  }

  isNodeSelected(index: number): boolean {
    return this.selectedNodeIndex === index;
  }

  getPositionClass(index: number): string {
    const positions = ['center', 'right', 'left', 'center', 'right', 'left', 'center', 'right', 'left'];
    return positions[index] || 'center';
  }

  getStatusBadgeText(status: string): string {
    switch (status) {
      case 'concluido':
        return 'Concluído';
      case 'andamento':
        return 'Em andamento';
      case 'nao-iniciado':
        return 'Não iniciado';
      default:
        return '';
    }
  }

  getStatusBadgeClass(status: string): string {
    return status;
  }

  get selectedWeekCards() {
    if (this.selectedNodeIndex === null) {
      const activeWeek = this.semanas.find(s => s.status === 'active' || s.status === 'completed');
      return activeWeek?.cards || [];
    }
    
    return this.semanas[this.selectedNodeIndex]?.cards || [];
  }

  get selectedWeekInfo() {
    if (this.selectedNodeIndex === null) {
      const activeWeek = this.semanas.find(s => s.status === 'active' || s.status === 'completed');
      return activeWeek || this.semanas[0];
    }
    
    return this.semanas[this.selectedNodeIndex] || this.semanas[0];
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    
    const clickedOnCard = (event.target as HTMLElement).closest('.progress-cards-inline');
    const clickedOnNode = (event.target as HTMLElement).closest('.semana-node');
    
    if (!clickedInside || (!clickedOnCard && !clickedOnNode && this.expandedNodeIndex !== null)) {
      const expandedCard = this.elementRef.nativeElement.querySelector('.progress-cards-inline');
      if (expandedCard && !expandedCard.contains(event.target as Node)) {
        this.expandedNodeIndex = null;
      }
    }
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  abrirModalTrilha(card: any): void {
    // Criar dados de exemplo para o modal
    const trilhaData: TrilhaData = {
      titulo: card.titulo,
      descricao: `Complete a trilha de ${card.semana} com questões, aulas e flashcards`,
      questoesPre: this.gerarQuestoesExemplo(card.questoes, card.titulo, 'pre'),
      aulas: this.gerarAulasExemplo(card.aulas, card.titulo),
      questoesPos: this.gerarQuestoesExemplo(card.questoes, card.titulo, 'pos'),
      flashcards: this.gerarFlashcardsExemplo(card.flashcards, card.titulo),
      progresso: card.progresso,
      etapaAtual: 'questoes-pre',
      etapasCompletas: []
    };

    // Abrir o modal
    this.modalTrilhaService.openModal(trilhaData);

    // Escutar o evento de iniciar trilha
    const subscription = this.modalTrilhaService.iniciarTrilha$.subscribe((tipo: 'questoes-pre' | 'aulas' | 'questoes-pos' | 'flashcards') => {
      console.log('Tipo de conteúdo selecionado:', tipo);
      console.log('Dados da trilha:', trilhaData);
      
      // Aqui você pode redirecionar ou iniciar a trilha baseado no tipo
      switch(tipo) {
        case 'questoes-pre':
          this.iniciarQuestoes(trilhaData.questoesPre, 'pré-teste');
          break;
        case 'questoes-pos':
          this.iniciarQuestoes(trilhaData.questoesPos, 'pós-teste');
          break;
        case 'aulas':
          this.iniciarAulas(trilhaData.aulas);
          break;
        case 'flashcards':
          this.iniciarFlashcards(trilhaData.flashcards);
          break;
      }
      
      subscription.unsubscribe();
    });
  }

  private gerarQuestoesExemplo(quantidade: number, tema: string, tipo: 'pre' | 'pos'): any[] {
    const questoes = [];
    const prefixo = tipo === 'pre' ? 'Aquecimento' : 'Pós-teste';
    
    for (let i = 1; i <= quantidade; i++) {
      questoes.push({
        id: i,
        titulo: `${prefixo} - Questão ${i} sobre ${tema}`,
        enunciado: `Em relação às lentes físicas, assinale a alternativa correta sobre ${tema}.`,
        disciplina: 'Oftalmologia',
        assunto: tema,
        ano: 2023,
        tipoProva: 'Prova de Especialidades (Teórica 2)',
        alternativas: [
          { letra: 'A', texto: 'São indicadas para correção de altas ametropias, porém não conseguem corrigir astigmatismo.' },
          { letra: 'B', texto: 'Independentemente do tipo de suporte, na técnica cirúrgica o primeiro passo é a facoemulsificação.' },
          { letra: 'C', texto: 'As lentes de suporte angular necessitam uso do fio de prolene 10-0.' },
          { letra: 'D', texto: 'As lentes de suporte iriano podem ser utilizadas para miopia, hipermetropia e afacia.' }
        ],
        respostaCorreta: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
      });
    }
    return questoes;
  }

  private gerarAulasExemplo(quantidade: number, tema: string): any[] {
    const aulas = [];
    const duracoes = ['10 min', '15 min', '20 min', '25 min', '30 min'];
    for (let i = 1; i <= quantidade; i++) {
      aulas.push({
        id: i,
        titulo: `Aula ${i}: ${tema}`,
        duracao: duracoes[Math.floor(Math.random() * duracoes.length)],
        thumbnail: 'assets/imagens/aula-placeholder.jpg'
      });
    }
    return aulas;
  }

  private gerarFlashcardsExemplo(quantidade: number, tema: string): any[] {
    const flashcards = [];
    const perguntas = [
      { frente: `O que caracteriza ${tema}?`, verso: `Definição técnica sobre ${tema}` },
      { frente: `Quais são os principais sintomas?`, verso: `Lista de sintomas relacionados` },
      { frente: `Como é feito o diagnóstico?`, verso: `Métodos de diagnóstico utilizados` },
      { frente: `Qual é o tratamento indicado?`, verso: `Opções de tratamento disponíveis` },
      { frente: `Quais são as complicações?`, verso: `Possíveis complicações e riscos` }
    ];
    
    for (let i = 1; i <= quantidade; i++) {
      const pergunta = perguntas[(i - 1) % perguntas.length];
      flashcards.push({
        id: i,
        frente: pergunta.frente,
        verso: pergunta.verso
      });
    }
    return flashcards;
  }

  private iniciarQuestoes(questoes: any[], tipo: string): void {
    console.log(`🎯 Iniciando questões de ${tipo}:`, questoes);
    alert(`Iniciando ${questoes.length} questões de ${tipo}!`);
    // TODO: Implementar navegação para página de questões
    // this.router.navigate(['/questoes'], { queryParams: { trilha: true, tipo: tipo } });
  }

  private iniciarAulas(aulas: any[]): void {
    console.log('📚 Iniciando aulas:', aulas);
    alert(`Iniciando ${aulas.length} aulas!`);
    // TODO: Implementar navegação para página de aulas
    // this.router.navigate(['/aulas'], { queryParams: { trilha: true } });
  }

  private iniciarFlashcards(flashcards: any[]): void {
    console.log('🎴 Iniciando flashcards:', flashcards);
    alert(`Iniciando ${flashcards.length} flashcards!`);
    // TODO: Implementar navegação para página de flashcards
    // this.router.navigate(['/flashcards'], { queryParams: { trilha: true } });
  }
}