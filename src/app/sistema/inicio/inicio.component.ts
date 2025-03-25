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
      setTimeout(() => {
        this.mostrarMensagemAulas = false;
      }, 3000); // 3 segundos
    } else if (tipo === 'flashcard') {
      this.mostrarMensagemFlashcard = true;
      setTimeout(() => {
        this.mostrarMensagemFlashcard = false;
      }, 3000); //  3 segundos
    }
  }

}
