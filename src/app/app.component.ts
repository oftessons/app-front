import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalDeleteService } from './services/modal-delete.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'oftlessons-app';

  @ViewChild('modalDeleteOutlet', { read: ViewContainerRef })
  modalDeleteOutlet!: ViewContainerRef;

  constructor(
    private modalDeleteService: ModalDeleteService,
  ){}

  ngAfterViewInit(): void {
    this.modalDeleteService.registerOutlet(this.modalDeleteOutlet);
  }
}
