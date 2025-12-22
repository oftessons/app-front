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
  erroTelefone: boolean = false; 

  onClose() {
    this.close.emit();
    this.formInvalido = false;
    this.erroTelefone = false;
  }

  
  formatarTelefone(event: any) {
    let input = event.target;
    let value = input.value.replace(/\D/g, ''); 
    
    
    if (value.length > 11) value = value.slice(0, 11);

    
    if (value.length > 10) {
      value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 5) {
      value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d\d)(\d{0,5}).*/, '($1) $2');
    } else {
      value = value.replace(/^(\d*)/, '($1');
    }

    input.value = value;
  }

  
  processarEnvio(nome: string, telefone: string, email: string, mensagem: string, termos: boolean) {
    
    const telLimpo = telefone.replace(/\D/g, '');

    const isTelefoneValido = telLimpo.length >= 10 && telLimpo.length <= 11;
    const isNomeValido = !!nome.trim();
    
    if (!isNomeValido || !isTelefoneValido || !termos) {
      this.formInvalido = true;
      
      
      if (!isTelefoneValido && telefone.length > 0) {
        this.erroTelefone = true;
      } else {
        this.erroTelefone = false;
      }
      return;
    }
    
    this.formInvalido = false;
    this.erroTelefone = false;

    
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