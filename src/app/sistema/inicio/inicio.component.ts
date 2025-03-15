import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  mostrarMensagemAulas: boolean = false;
  mostrarMensagemFlashcard: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  exibirMensagem(tipo: string): void {
    if (tipo === 'aulas') {
      this.mostrarMensagemAulas = true;
    } else if (tipo === 'flashcard') {
      this.mostrarMensagemFlashcard = true;
    }
  }
  
}
