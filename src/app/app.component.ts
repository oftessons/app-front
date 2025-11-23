import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalDeleteService } from './services/modal-delete.service';
import { ModalTrilhaService } from './services/modal-trilha.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'oftlessons-app';

  @ViewChild('modalDeleteOutlet', { read: ViewContainerRef })
  modalDeleteOutlet!: ViewContainerRef;

  @ViewChild('modalTrilhaOutlet', { read: ViewContainerRef })
  modalTrilhaOutlet!: ViewContainerRef;

  @ViewChild('modalSimuladoOutlet', { read: ViewContainerRef })
  modalSimuladoOutlet!: ViewContainerRef;

  constructor(
    private modalDeleteService: ModalDeleteService,
    private modalTrilhaService: ModalTrilhaService,
  ){}

  ngAfterViewInit(): void {
    this.modalDeleteService.registerOutlet(this.modalDeleteOutlet);
    this.modalTrilhaService.registerOutlet(this.modalTrilhaOutlet);
  }
}
