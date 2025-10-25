import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { TrilhaData } from 'src/app/services/modal-trilha.service';

type TipoConteudo = 'questoes-pre' | 'aulas' | 'questoes-pos' | 'flashcards';
type ModoVisualizacao = 'selecao' | 'executando' | 'resumo';

@Component({
  selector: 'app-modal-trilha',
  templateUrl: './modal-trilha.component.html',
  styleUrls: ['./modal-trilha.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalTrilhaComponent implements OnInit {
  @Input() title: string = 'Iniciar Trilha';
  @Input() size: string = 'max-w-4xl';
  @Input() contentTemplate?: TemplateRef<any>;
  @Input() trilhaData!: TrilhaData;

  @Output() closeModal = new EventEmitter<void>();
  @Output() iniciarTrilha = new EventEmitter<TipoConteudo>();

  // Controle de fluxo
  modoAtual: ModoVisualizacao = 'selecao';
  etapaAtual: TipoConteudo = 'questoes-pre';
  etapasCompletas: Set<string> = new Set();
  
  // Controle de questões
  questaoAtualIndex: number = 0;
  respostasUsuario: Map<number, string> = new Map();
  questoesAtuais: any[] = [];
  tipoQuestoesAtual: 'pre' | 'pos' = 'pre';
  jaRespondeu: boolean = false; // Controle se já respondeu a questão atual
  isRespostaCorreta: boolean = false; // Se a resposta está correta

  // Controle de aulas
  aulaAtualIndex: number = 0;
  
  // Estatísticas do resumo
  acertos: number = 0;
  erros: number = 0;

  // Expor Math para o template
  Math = Math;

  constructor() {}

  ngOnInit(): void {
    // Inicializa etapas completas se fornecidas
    if (this.trilhaData?.etapasCompletas) {
      this.etapasCompletas = new Set(this.trilhaData.etapasCompletas);
    }
    
    // Define etapa atual baseada no progresso
    if (this.trilhaData?.etapaAtual) {
      this.etapaAtual = this.trilhaData.etapaAtual;
    }
  }

  // ============ CONTROLE DE FLUXO ============
  
  iniciarEtapa(tipo: TipoConteudo): void {
    this.etapaAtual = tipo;
    this.modoAtual = 'executando';
    
    if (tipo === 'questoes-pre' || tipo === 'questoes-pos') {
      this.iniciarQuestoes(tipo);
    } else if (tipo === 'aulas') {
      this.iniciarAulas();
    } else if (tipo === 'flashcards') {
      this.iniciarFlashcards();
    }
  }

  voltarParaSelecao(): void {
    this.modoAtual = 'selecao';
    this.questaoAtualIndex = 0;
    this.aulaAtualIndex = 0;
  }

  etapaBloqueada(tipo: TipoConteudo): boolean {
    const ordem: TipoConteudo[] = ['questoes-pre', 'aulas', 'questoes-pos', 'flashcards'];
    const indexAtual = ordem.indexOf(tipo);
    
    // Primeira etapa sempre desbloqueada
    if (indexAtual === 0) return false;
    
    // Verifica se a etapa anterior foi completa
    const etapaAnterior = ordem[indexAtual - 1];
    return !this.etapasCompletas.has(etapaAnterior);
  }

  proximaEtapaDesbloqueada(): TipoConteudo | null {
    const ordem: TipoConteudo[] = ['questoes-pre', 'aulas', 'questoes-pos', 'flashcards'];
    
    for (const etapa of ordem) {
      if (!this.etapasCompletas.has(etapa)) {
        return etapa;
      }
    }
    
    return null; // Todas completas
  }

  // ============ QUESTÕES ============

  iniciarQuestoes(tipo: 'questoes-pre' | 'questoes-pos'): void {
    this.tipoQuestoesAtual = tipo === 'questoes-pre' ? 'pre' : 'pos';
    this.questoesAtuais = tipo === 'questoes-pre' ? this.trilhaData.questoesPre : this.trilhaData.questoesPos;
    this.questaoAtualIndex = 0;
    this.respostasUsuario.clear();
    this.jaRespondeu = false;
    this.isRespostaCorreta = false;
  }

  get questaoAtual(): any {
    return this.questoesAtuais[this.questaoAtualIndex];
  }

  get totalQuestoes(): number {
    return this.questoesAtuais.length;
  }

  selecionarResposta(alternativa: string): void {
    // Só permite selecionar se ainda não respondeu
    if (!this.jaRespondeu) {
      this.respostasUsuario.set(this.questaoAtualIndex, alternativa);
    }
  }

  respostaSelecionada(alternativa: string): boolean {
    return this.respostasUsuario.get(this.questaoAtualIndex) === alternativa;
  }

  responderQuestao(): void {
    if (!this.jaRespondeu && this.respostasUsuario.has(this.questaoAtualIndex)) {
      const respostaUsuario = this.respostasUsuario.get(this.questaoAtualIndex);
      const questao = this.questaoAtual;
      
      // Verifica se a resposta está correta
      this.isRespostaCorreta = respostaUsuario === questao.respostaCorreta;
      
      // Marca que já respondeu esta questão
      this.jaRespondeu = true;
      
      // Aqui você pode adicionar lógica para exibir feedback visual
      console.log(this.isRespostaCorreta ? 'Resposta correta!' : 'Resposta incorreta!');
    }
  }

  proximaQuestao(): void {
    if (this.questaoAtualIndex < this.questoesAtuais.length - 1) {
      this.questaoAtualIndex++;
      this.jaRespondeu = false; // Reset para a próxima questão
      this.isRespostaCorreta = false;
    } else {
      this.finalizarQuestoes();
    }
  }

  questaoAnterior(): void {
    if (this.questaoAtualIndex > 0) {
      this.questaoAtualIndex--;
      // Verifica se já tinha respondido esta questão antes
      this.jaRespondeu = this.respostasUsuario.has(this.questaoAtualIndex);
    }
  }

  finalizarQuestoes(): void {
    // Calcular estatísticas
    this.acertos = 0;
    this.erros = 0;
    
    this.questoesAtuais.forEach((questao, index) => {
      const respostaUsuario = this.respostasUsuario.get(index);
      if (respostaUsuario === questao.respostaCorreta) {
        this.acertos++;
      } else {
        this.erros++;
      }
    });

    // Marcar etapa como completa
    const etapaKey = this.tipoQuestoesAtual === 'pre' ? 'questoes-pre' : 'questoes-pos';
    this.etapasCompletas.add(etapaKey);
    
    // Mostrar resumo
    this.modoAtual = 'resumo';
  }

  // ============ AULAS ============

  iniciarAulas(): void {
    this.aulaAtualIndex = 0;
    // Aqui você pode abrir um player de vídeo ou redirecionar
    console.log('Iniciando aulas:', this.trilhaData.aulas);
    
    // Para o exemplo, vamos marcar como completo imediatamente
    // Na implementação real, você vai marcar quando todas as aulas forem assistidas
    this.marcarAulasCompletas();
  }

  marcarAulasCompletas(): void {
    this.etapasCompletas.add('aulas');
    this.modoAtual = 'resumo';
  }

  // ============ FLASHCARDS ============

  iniciarFlashcards(): void {
    console.log('Iniciando flashcards:', this.trilhaData.flashcards);
    this.iniciarTrilha.emit('flashcards');
  }

  // ============ HELPERS ============

  getQuantidade(tipo: TipoConteudo): number {
    switch (tipo) {
      case 'questoes-pre':
        return this.trilhaData?.questoesPre?.length || 0;
      case 'aulas':
        return this.trilhaData?.aulas?.length || 0;
      case 'questoes-pos':
        return this.trilhaData?.questoesPos?.length || 0;
      case 'flashcards':
        return this.trilhaData?.flashcards?.length || 0;
      default:
        return 0;
    }
  }

  temConteudo(tipo: TipoConteudo): boolean {
    return this.getQuantidade(tipo) > 0;
  }

  getNomeTipo(tipo: TipoConteudo): string {
    switch (tipo) {
      case 'questoes-pre':
        return 'Questões de Aquecimento';
      case 'aulas':
        return 'Vídeo Aulas';
      case 'questoes-pos':
        return 'Questões Pós-Teste';
      case 'flashcards':
        return 'Flashcards';
      default:
        return '';
    }
  }

  getIconeTipo(tipo: TipoConteudo): string {
    switch (tipo) {
      case 'questoes-pre':
      case 'questoes-pos':
        return 'assets/imagens/caderno.svg';
      case 'aulas':
        return 'assets/Icons/aula.svg';
      case 'flashcards':
        return 'assets/Icons/flashcards.svg';
      default:
        return '';
    }
  }

  getPorcentagemProgresso(): number {
    const total = 4; // Total de etapas
    const completas = this.etapasCompletas.size;
    return Math.round((completas / total) * 100);
  }

  onModalClose(): void {
    this.closeModal.emit();
  }
}
