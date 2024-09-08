import { Ano } from './page-questoes/enums/ano';
import { Dificuldade } from './page-questoes/enums/dificuldade';
import { Subtema } from './page-questoes/enums/subtema';
import { Tema } from './page-questoes/enums/tema';
import { TipoDeProva } from './page-questoes/enums/tipoDeProva';

export class Simulado {
  id?: number; // Torna o campo id opcional
  nomeSimulado!: string;
  assunto!: string;
  qtdQuestoes!: number | null;
  ano!: Ano | null;
  tema!: Tema | null;
  dificuldade!: Dificuldade | null;
  tipoDeProva!: TipoDeProva | null;
  subtema!: Subtema | null;
  questaoIds!: number[] | null;
}
