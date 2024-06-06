import { Ano } from './enums/ano';
import { Tema } from './enums/tema';
import { Dificuldade } from './enums/dificuldade';
import { TipoDeProva } from './enums/tipoDeProva';
import { Subtema } from './enums/subtema';

export class Questao {
  id!: number;
  title!: string;
  enunciadoDaQuestao!: string;
  corpoDaQuestao!: string;
  ano!: Ano;
  tema!: Tema;
  dificuldade!: Dificuldade;
  tipoDeProva!: TipoDeProva;
  subtema!: Subtema;
  fotoDaQuestao!: string;  // Use string para URL da imagem
  fotoDaResposta!: string; // Use string para URL da imagem
  comentarioDaQuestao!: string;
}
