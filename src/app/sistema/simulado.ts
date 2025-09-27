import { Ano } from './page-questoes/enums/ano';
import { Dificuldade } from './page-questoes/enums/dificuldade';
import { Subtema } from './page-questoes/enums/subtema';
import { Tema } from './page-questoes/enums/tema';
import { TipoDeProva } from './page-questoes/enums/tipoDeProva';
import { QuantidadeDeQuestoesSelecionadas } from './page-questoes/enums/quant-questoes';
import { RespostasSimulado } from './page-questoes/enums/resp-simu';
import { StatusSimulado } from './meus-simulados/status-simulado';

export class Simulado {
  id?: number; // Torna o campo id opcional
  nomeSimulado!: string;
  assunto!: string;
  quantidadeDeQuestoesSelecionadas!: QuantidadeDeQuestoesSelecionadas | null;
  ano!: Ano | null;
  tema!: Tema | null;
  dificuldade!: Dificuldade | null;
  tipoDeProva!: TipoDeProva | null;
  subtema!: Subtema | null;
  questaoIds!: number[] | null;
  respostasSimulado!: RespostasSimulado | null;
  statusSimulado!: StatusSimulado;
  tempoDecorrido!: string | null;
}
