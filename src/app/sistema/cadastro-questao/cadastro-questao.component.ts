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

  removeOption(index: number) {
    if (this.options.length > 1) {
      this.options.splice(index, 1);

      // Atualiza os valores
      for (let i = 0; i < this.options.length; i++) {
          this.options[i].value = String.fromCharCode(65 + i); // 65 é o código ASCII para 'A'
      }
  } else {
      alert('Pelo menos uma alternativa.');
  }
}

showImage(event: any, index: number) {
  if (event.target.files && event.target.files[0]) {
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
        this.options[index].image = e.target.result;
    }

    reader.readAsDataURL(event.target.files[0]);
}
}

cadastrarQuestao() {
}

limparFormulario() {
}

confirmarCadastro() {
}

}
