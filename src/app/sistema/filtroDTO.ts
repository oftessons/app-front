import { Ano } from "./page-questoes/enums/ano";
import { Subtema } from "./page-questoes/enums/subtema";
import { Tema } from "./page-questoes/enums/tema";
import { TipoDeProva } from "./page-questoes/enums/tipoDeProva";
import { Dificuldade } from "./page-questoes/enums/dificuldade";

export class FiltroDTO {
  id?: number;
  nome!: string;
  assunto!: string;
  ano!: string[] | null;
  tema!: string[] | null;
  dificuldade!: string[] | null;
  tipoDeProva!: string[] | null;
  subtema!: string[] | null;
}
