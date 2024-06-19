import { Ano } from './enums/ano';
import { Tema } from './enums/tema';
import { Dificuldade } from './enums/dificuldade';
import { TipoDeProva } from './enums/tipoDeProva';
import { Subtema } from './enums/subtema';
import { Alternativa } from '../alternativa';

export class Questao {
  id!: number;
  title!: string;
  enunciadoDaQuestao!: string;
  descricaoUm!: string;
  descricaoDois!: string;
  descricaoTres!: string;
  descricaoQuatro!: string;
  assinale!: string;
  fotoDaQuestao!: string;
  fotoDaQuestaoDois!: string;
  fotoDaResposta!: string;
  fotoDaRespostaDois!: string;
  comentarioDaQuestao!: string;
  ano!: Ano;
  tema!: Tema;
  dificuldade!: Dificuldade;
  tipoDeProva!: TipoDeProva;
  subtema!: Subtema;
  palavraChave!: string;
  alternativas: Alternativa[] = [];
}
