export class Resposta {
  correct: boolean;
  opcaoSelecionada: string; // Adiciona a propriedade opcaoSelecionada
  opcaoCorreta: string;      // Adiciona a propriedade opcaoCorreta

  constructor(correct: boolean, opcaoSelecionada: string, opcaoCorreta: string) {
      this.correct = correct;
      this.opcaoSelecionada = opcaoSelecionada; // Inicializa opcaoSelecionada
      this.opcaoCorreta = opcaoCorreta;         // Inicializa opcaoCorreta
  }
}
