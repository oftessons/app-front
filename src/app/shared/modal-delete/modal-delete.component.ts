import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-delete',
  templateUrl: './modal-delete.component.html',
  styleUrls: ['./modal-delete.component.css'],
})
export class ModalDeleteComponent {
  @Input() title: string = 'Excluir item';
  @Input() description: string = 'Tem certeza que deseja excluir o item abaixo?';
  @Input() item: any;
  @Input() deletarTextoBotao: string = 'Excluir';
  @Input() size: string = 'xl:max-w-7xl';

  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<void>();

  onModalClose() {
    this.closeModal.emit();
  }

  confirmarExclusao(): void {
    this.confirmDelete.emit();
  }
}