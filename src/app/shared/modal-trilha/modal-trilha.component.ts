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
import { AnimationOptions } from 'ngx-lottie';

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

  modoAtual: ModoVisualizacao = 'selecao';
  etapaAtual: TipoConteudo = 'questoes-pre';
  etapasCompletas: Set<string> = new Set();
  
  questaoAtualIndex: number = 0;
  respostasUsuario: Map<number, string> = new Map();
  questoesAtuais: any[] = [];
  tipoQuestoesAtual: 'pre' | 'pos' = 'pre';
  jaRespondeu: boolean = false; 
  isRespostaCorreta: boolean = false; 

  aulaAtualIndex: number = 0;
  
  acertos: number = 0;
  erros: number = 0;
  flashcardsEstudados: number = 0;
  tempoTotal: string = '';

  animacaoDesbloqueioOptions: AnimationOptions = {
    path: 'assets/animations/trofeu.json',
    loop: false,
    autoplay: true
  };

  
  Math = Math;

  constructor() {}

  ngOnInit(): void {
    
    if (this.trilhaData?.etapasCompletas) {
      this.etapasCompletas = new Set(this.trilhaData.etapasCompletas);
    }
    
    if (this.trilhaData?.etapaAtual) {
      this.etapaAtual = this.trilhaData.etapaAtual;
    }

    const primeiraEtapa = this.proximaEtapaDesbloqueada();
    if (primeiraEtapa) {
      this.iniciarEtapa(primeiraEtapa);
    }
  }

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
    
    const proximaEtapa = this.proximaEtapaDesbloqueada();
    if (proximaEtapa) {
      this.questaoAtualIndex = 0;
      this.aulaAtualIndex = 0;
      this.iniciarEtapa(proximaEtapa);
    } else {
      
      this.onModalClose();
    }
  }

  etapaBloqueada(tipo: TipoConteudo): boolean {
    const ordem: TipoConteudo[] = ['questoes-pre', 'aulas', 'questoes-pos', 'flashcards'];
    const indexAtual = ordem.indexOf(tipo);
    
    if (indexAtual === 0) return false;
    
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
    
    return null; 
  }

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
      
      this.isRespostaCorreta = respostaUsuario === questao.respostaCorreta;
      
      this.jaRespondeu = true;
      
      console.log(this.isRespostaCorreta ? 'Resposta correta!' : 'Resposta incorreta!');
    }
  }

  proximaQuestao(): void {
    if (this.questaoAtualIndex < this.questoesAtuais.length - 1) {
      this.questaoAtualIndex++;
      this.jaRespondeu = false; 
      this.isRespostaCorreta = false;
    } else {
      this.finalizarQuestoes();
    }
  }

  questaoAnterior(): void {
    if (this.questaoAtualIndex > 0) {
      this.questaoAtualIndex--;
      
      this.jaRespondeu = this.respostasUsuario.has(this.questaoAtualIndex);
    }
  }

  finalizarQuestoes(): void {
    
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

    const etapaKey = this.tipoQuestoesAtual === 'pre' ? 'questoes-pre' : 'questoes-pos';
    this.etapasCompletas.add(etapaKey);
    
    this.modoAtual = 'resumo';
  }

  iniciarAulas(): void {
    this.aulaAtualIndex = 0;
    
    console.log('Iniciando aulas:', this.trilhaData.aulas);
    
    this.marcarAulasCompletas();
  }

  marcarAulasCompletas(): void {
    this.etapasCompletas.add('aulas');
    this.modoAtual = 'resumo';
  }

  iniciarFlashcards(): void {
    console.log('Iniciando flashcards:', this.trilhaData.flashcards);
    
    this.flashcardsEstudados = this.trilhaData?.flashcards?.length || 0;
    
    this.marcarFlashcardsCompletos();
  }

  marcarFlashcardsCompletos(): void {
    this.etapasCompletas.add('flashcards');
    this.modoAtual = 'resumo';
  }

  

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
    const total = 4; 
    const completas = this.etapasCompletas.size;
    return Math.round((completas / total) * 100);
  }

  getNomeBotaoProximaEtapa(): string {
    const proximaEtapa = this.proximaEtapaDesbloqueada();
    switch (proximaEtapa) {
      case 'questoes-pre':
        return 'Iniciar questões';
      case 'aulas':
        return 'Assistir agora';
      case 'questoes-pos':
        return 'Fazer pós-teste';
      case 'flashcards':
        return 'Revisar flashcards';
      default:
        return 'Continuar';
    }
  }

  getSubtituloResumo(): string {
    const proximaEtapa = this.proximaEtapaDesbloqueada();
    switch (proximaEtapa) {
      case 'aulas':
        return 'Dê continuidade e assista a aula para fixar o conteúdo.';
      case 'questoes-pos':
        return 'Complete o pós-teste para avaliar seu aprendizado.';
      case 'flashcards':
        return 'Revise os flashcards para memorizar o conteúdo.';
      default:
        return 'Continue sua jornada de aprendizado.';
    }
  }

  calcularDesempenho(): number {
    const total = this.acertos + this.erros;
    if (total === 0) return 0;
    return Math.round((this.acertos / total) * 100);
  }

  onModalClose(): void {
    this.closeModal.emit();
  }
}
