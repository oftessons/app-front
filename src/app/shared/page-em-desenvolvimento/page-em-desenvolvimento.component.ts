import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-em-desenvolvimento',
  templateUrl: './page-em-desenvolvimento.component.html',
  styleUrls: ['./page-em-desenvolvimento.component.css']
})
export class PageEmDesenvolvimentoComponent {
  @Input() titulo: string = 'Página em Desenvolvimento';
  @Input() subtitulo: string = 'Esta funcionalidade está sendo desenvolvida e estará disponível em breve.';
  @Input() mostrarIcone: boolean = true;
  @Input() mostrarBotaoVoltar: boolean = true;
  @Input() rotaVoltar: string = '/usuario/inicio';

  constructor() { }

  voltar() {
    window.history.back();
  }
}