import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cadastro-questao',
  templateUrl: './cadastro-questao.component.html',
  styleUrls: ['./cadastro-questao.component.css']
})
export class CadastroQuestaoComponent implements OnInit {
  options = [{ title: 'Opção 1', value: 'A', image: null }];

  constructor() { }

  ngOnInit(): void {
  }

  addOption() {
    const nextOptionValue = String.fromCharCode(this.options[this.options.length - 1].value.charCodeAt(0) + 1);
    this.options.push({ title: `Opção ${this.options.length + 1}`, value: nextOptionValue, image: null });
  }

cadastrarQuestao() {
}

limparFormulario() {
}

confirmarCadastro() {
}

}
