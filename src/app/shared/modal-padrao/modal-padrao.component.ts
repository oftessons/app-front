import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

export interface ModalPadraoConfig {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  // Configuração dos botões
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonClass?: 'primary' | 'danger' | 'success' | 'warning';
  
  // Ícone ou imagem
  iconSrc?: string;
  iconAlt?: string;
  showIcon?: boolean;
  
  // Outros
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
}

@Component({
  selector: 'app-modal-padrao',
  templateUrl: './modal-padrao.component.html',
  styleUrls: ['./modal-padrao.component.css'],
})
export class ModalPadraoComponent {
  // Configurações básicas
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  
  // Configuração dos botões
  @Input() showConfirmButton: boolean = true;
  @Input() showCancelButton: boolean = true;
  @Input() confirmButtonText: string = 'Confirmar';
  @Input() cancelButtonText: string = 'Cancelar';
  @Input() confirmButtonClass: 'primary' | 'danger' | 'success' | 'warning' = 'primary';
  
  // Ícone
  @Input() iconSrc: string = '';
  @Input() iconAlt: string = 'Ícone';
  @Input() showIcon: boolean = false;
  
  // Outros
  @Input() closeOnBackdropClick: boolean = true;
  @Input() showCloseButton: boolean = true;
  
  // Template customizado para o conteúdo
  @Input() contentTemplate: TemplateRef<any> | null = null;
  
  // Eventos
  @Output() closeModal = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onBackdropClick(): void {
    if (this.closeOnBackdropClick) {
      this.onCancel();
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
    this.closeModal.emit();
  }

  getButtonClass(): string {
    const classMap: Record<string, string> = {
      'primary': 'btn-primary',
      'danger': 'btn-danger',
      'success': 'btn-success',
      'warning': 'btn-warning'
    };
    return classMap[this.confirmButtonClass] || 'btn-primary';
  }
}
