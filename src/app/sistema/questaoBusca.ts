import { Ano } from "./page-questoes/enums/ano";
import { TipoDeProva } from "./page-questoes/enums/tipoDeProva";

export class QuestaoBusca {
  id!: number;
  title!: string;
  enunciadoDaQuestao!: string;
  ano!: Ano;
  tipoDeProva!: TipoDeProva;

}
