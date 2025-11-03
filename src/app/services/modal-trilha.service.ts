import {
  Injectable,
  ComponentRef,
  ViewContainerRef,
  TemplateRef,
  ComponentFactoryResolver,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ModalTrilhaComponent } from '../shared/modal-trilha/modal-trilha.component';

export interface TrilhaData {
  id?: number;
  titulo: string;
  descricao?: string;
  questoesPre: any[];  // Questões de aquecimento (pré-teste)
  aulas: any[];
  questoesPos: any[];  // Questões pós-teste
  flashcards: any[];
  progresso?: number;
  etapaAtual?: 'questoes-pre' | 'aulas' | 'questoes-pos' | 'flashcards';
  etapasCompletas?: string[];
}

@Injectable({ providedIn: 'root' })
export class ModalTrilhaService {
  private outlet!: ViewContainerRef;
  private modalRef!: ComponentRef<ModalTrilhaComponent>;
  
  // Subject para emitir eventos de iniciar trilha
  private iniciarTrilhaSubject = new Subject<'questoes-pre' | 'aulas' | 'questoes-pos' | 'flashcards'>();
  public iniciarTrilha$ = this.iniciarTrilhaSubject.asObservable();

  constructor(private cfr: ComponentFactoryResolver) {}

  registerOutlet(outlet: ViewContainerRef): void {
    this.outlet = outlet;
  }

  openModal(
    trilhaData: TrilhaData,
    config?: Partial<ModalTrilhaComponent>,
    contentTemplate?: TemplateRef<any>
  ): void {
    if (!this.outlet) throw new Error('Outlet não registrado!');
    this.outlet.clear();

    const factory = this.cfr.resolveComponentFactory(ModalTrilhaComponent);
    this.modalRef = this.outlet.createComponent(factory);

    // Define os dados da trilha
    this.modalRef.instance.trilhaData = trilhaData;

    // Aplica configurações opcionais
    if (config) {
      Object.assign(this.modalRef.instance, config);
    }

    // Template customizado (opcional)
    if (contentTemplate) {
      this.modalRef.instance.contentTemplate = contentTemplate;
    }

    // Evento de fechar
    this.modalRef.instance.closeModal.subscribe(() => {
      this.closeModal();
    });

    // Evento de iniciar trilha
    this.modalRef.instance.iniciarTrilha.subscribe((tipo: 'questoes-pre' | 'aulas' | 'questoes-pos' | 'flashcards') => {
      this.iniciarTrilhaSubject.next(tipo);
      this.closeModal();
    });
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.destroy();
    }
  }
}
