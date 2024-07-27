import { Questao } from "./page-questoes/questao";

export class Alternativa {
  id?: number;
  texto!: string;
  correta!: boolean;
  questao?: Questao; // Adiciona a relação com Questao
}
