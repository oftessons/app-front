import {
  Injectable,
  ComponentRef,
  ViewContainerRef,
  ComponentFactoryResolver,
} from '@angular/core';
import { ModalDeleteComponent } from '../shared/modal-delete/modal-delete.component';

@Injectable({ providedIn: 'root' })
export class ModalDeleteService {
  private outlet!: ViewContainerRef;
  private modalRef!: ComponentRef<ModalDeleteComponent>;

  constructor(private cfr: ComponentFactoryResolver) {}

  registerOutlet(outlet: ViewContainerRef): void {
    this.outlet = outlet;
  }

  openModal(
    config?: Partial<ModalDeleteComponent>,
    onConfirmDelete?: () => void,
    onCancel?: () => void
  ): void {
    if (!this.outlet) throw new Error('Outlet não registrado!');
    this.outlet.clear();

    const factory = this.cfr.resolveComponentFactory(ModalDeleteComponent);
    this.modalRef = this.outlet.createComponent(factory);

    if (config) {
      Object.assign(this.modalRef.instance, config);
    }

    this.modalRef.instance.closeModal.subscribe(() => {
      if (onCancel) onCancel();
      this.closeModal();
    });

    this.modalRef.instance.confirmDelete.subscribe(() => {
      if (onConfirmDelete) onConfirmDelete();
      this.closeModal();
    });
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.destroy();
    }
  }
}
