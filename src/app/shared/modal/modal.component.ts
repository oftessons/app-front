import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {

  @Input() show: boolean = false;
  @Input() title: string = "Modal";
  @Input() size: string = "xl:max-w-7xl";
  @Input() footer: boolean = true;

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveModal = new EventEmitter<void>();

  handleSave(): void {
    this.saveModal.emit();  // Remove this.show = false, pois o controle deve ser feito pelo componente pai
  }

  onModalClose(): void {
    this.closeModal.emit();  // Remove this.show = false, pois o controle deve ser feito pelo componente pai
  }

}