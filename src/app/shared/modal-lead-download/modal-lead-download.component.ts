import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-lead-download',
  templateUrl: './modal-lead-download.component.html',
  styleUrls: ['./modal-lead-download.component.css']
})
export class ModalLeadDownloadComponent {
  
  @Input() isOpen: boolean = false;
  @Input() materialTitle: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<any>();

  
  formInvalido: boolean = false;

  onClose() {
    this.close.emit();
    this.formInvalido = false; 
  }

  
  processarEnvio(nome: string, telefone: string, email: string, mensagem: string, termos: boolean) {
    
    
    if (!nome || !telefone || !termos) {
      this.formInvalido = true;
      return; 
    }

    this.formInvalido = false;

    const dadosCapturados = {
      nome: nome,
      telefone: telefone,
      email: email,
      mensagem: mensagem,
      termos: termos
    };

    
    this.submitForm.emit(dadosCapturados);
  }
}