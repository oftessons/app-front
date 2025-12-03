import {
  Injectable,
  ComponentRef,
  ViewContainerRef,
  TemplateRef,
  ComponentFactoryResolver,
} from '@angular/core';
import { ModalPadraoComponent, ModalPadraoConfig } from '../shared/modal-padrao/modal-padrao.component';
import { Subject } from 'rxjs';

export interface ModalPadraoOptions extends ModalPadraoConfig {
  contentTemplate?: TemplateRef<any>;
}

export interface ModalPadraoResult {
  confirmed: boolean;
}

@Injectable({ providedIn: 'root' })
export class ModalPadraoService {
  private outlet!: ViewContainerRef;
  private modalRef!: ComponentRef<ModalPadraoComponent>;
  private resultSubject = new Subject<ModalPadraoResult>();

  constructor(private cfr: ComponentFactoryResolver) {}

  registerOutlet(outlet: ViewContainerRef): void {
    this.outlet = outlet;
  }

  /**
   * Abre o modal com as configurações especificadas
   * @param config Configurações do modal
   * @param onConfirm Callback executado ao confirmar
   * @param onCancel Callback executado ao cancelar
   */
  openModal(
    config?: ModalPadraoOptions,
    onConfirm?: () => void,
    onCancel?: () => void
  ): void {
    if (!this.outlet) {
      throw new Error('Outlet do ModalPadrao não registrado! Certifique-se de registrar o outlet no AppComponent.');
    }
    
    this.outlet.clear();
    
    const factory = this.cfr.resolveComponentFactory(ModalPadraoComponent);
    this.modalRef = this.outlet.createComponent(factory);

    // Aplicar configurações
    if (config) {
      this.applyConfig(config);
    }

    // Listeners de eventos
    this.modalRef.instance.closeModal.subscribe(() => {
      this.closeModal();
    });

    this.modalRef.instance.confirm.subscribe(() => {
      this.resultSubject.next({ confirmed: true });
      // Fecha o modal antes de chamar o callback para permitir abrir outro modal no callback
      this.closeModal();
      if (onConfirm) onConfirm();
    });

    this.modalRef.instance.cancel.subscribe(() => {
      this.resultSubject.next({ confirmed: false });
      // Fecha o modal antes de chamar o callback para permitir abrir outro modal no callback
      this.closeModal();
      if (onCancel) onCancel();
    });
  }

  /**
   * Abre o modal e retorna uma Promise com o resultado
   * @param config Configurações do modal
   * @returns Promise que resolve com o resultado do modal
   */
  openModalAsync(config?: ModalPadraoOptions): Promise<ModalPadraoResult> {
    return new Promise((resolve) => {
      this.openModal(
        config,
        () => resolve({ confirmed: true }),
        () => resolve({ confirmed: false })
      );
    });
  }

  /**
   * Abre um modal de confirmação simples
   */
  confirm(
    title: string,
    description: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.openModal(
        {
          title,
          description,
          confirmButtonText: confirmText,
          cancelButtonText: cancelText,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonClass: 'primary'
        },
        () => resolve(true),
        () => resolve(false)
      );
    });
  }

  /**
   * Abre um modal de alerta (apenas botão de fechar)
   */
  alert(title: string, description: string, buttonText: string = 'OK'): Promise<void> {
    return new Promise((resolve) => {
      this.openModal(
        {
          title,
          description,
          confirmButtonText: buttonText,
          showConfirmButton: true,
          showCancelButton: false,
          confirmButtonClass: 'primary'
        },
        () => resolve(),
        () => resolve()
      );
    });
  }

  /**
   * Abre um modal de confirmação de exclusão
   */
  confirmDelete(
    title: string = 'Confirmar exclusão',
    description: string = 'Tem certeza que deseja excluir este item?',
    deleteText: string = 'Excluir',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.openModal(
        {
          title,
          description,
          confirmButtonText: deleteText,
          cancelButtonText: cancelText,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonClass: 'danger',
          iconSrc: 'assets/Icons/atencao.svg',
          showIcon: true
        },
        () => resolve(true),
        () => resolve(false)
      );
    });
  }

  /**
   * Abre um modal de sucesso
   */
  success(
    title: string = 'Sucesso!',
    description: string,
    buttonText: string = 'OK'
  ): Promise<void> {
    return new Promise((resolve) => {
      this.openModal(
        {
          title,
          description,
          confirmButtonText: buttonText,
          showConfirmButton: true,
          showCancelButton: false,
          confirmButtonClass: 'success'
        },
        () => resolve(),
        () => resolve()
      );
    });
  }

  /**
   * Abre um modal de aviso
   */
  warning(
    title: string = 'Atenção!',
    description: string,
    confirmText: string = 'Entendi',
    cancelText?: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.openModal(
        {
          title,
          description,
          confirmButtonText: confirmText,
          cancelButtonText: cancelText || 'Cancelar',
          showConfirmButton: true,
          showCancelButton: !!cancelText,
          confirmButtonClass: 'warning',
          iconSrc: 'assets/Icons/atencao.svg',
          showIcon: true
        },
        () => resolve(true),
        () => resolve(false)
      );
    });
  }

  /**
   * Fecha o modal atual
   */
  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.destroy();
    }
  }

  /**
   * Atualiza as propriedades do modal enquanto ele está aberto
   */
  updateConfig(config: Partial<ModalPadraoOptions>): void {
    if (this.modalRef) {
      this.applyConfig(config);
    }
  }

  private applyConfig(config: Partial<ModalPadraoOptions>): void {
    if (!this.modalRef) return;

    const instance = this.modalRef.instance;

    if (config.title !== undefined) instance.title = config.title;
    if (config.description !== undefined) instance.description = config.description;
    if (config.size !== undefined) instance.size = config.size;
    if (config.showConfirmButton !== undefined) instance.showConfirmButton = config.showConfirmButton;
    if (config.showCancelButton !== undefined) instance.showCancelButton = config.showCancelButton;
    if (config.confirmButtonText !== undefined) instance.confirmButtonText = config.confirmButtonText;
    if (config.cancelButtonText !== undefined) instance.cancelButtonText = config.cancelButtonText;
    if (config.confirmButtonClass !== undefined) instance.confirmButtonClass = config.confirmButtonClass;
    if (config.iconSrc !== undefined) instance.iconSrc = config.iconSrc;
    if (config.iconAlt !== undefined) instance.iconAlt = config.iconAlt;
    if (config.showIcon !== undefined) instance.showIcon = config.showIcon;
    if (config.closeOnBackdropClick !== undefined) instance.closeOnBackdropClick = config.closeOnBackdropClick;
    if (config.showCloseButton !== undefined) instance.showCloseButton = config.showCloseButton;
    if (config.contentTemplate !== undefined) instance.contentTemplate = config.contentTemplate;
  }
}
