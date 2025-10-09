import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { AnimationOptions } from 'ngx-lottie';

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
      // {
      //   titulo: 'Catarata',
      //   semana: 'Semana 3',
      //   status: 'nao-iniciado',
      //   aulas: 2,
      //   questoes: 20,
      //   flashcards: 20,
      //   tempo: '1h30',
      //   progresso: 0
      // }
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
    private elementRef: ElementRef
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
}