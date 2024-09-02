import { Ano } from "./page-questoes/enums/ano";
import { Subtema } from "./page-questoes/enums/subtema";
import { Tema } from "./page-questoes/enums/tema";
import { TipoDeProva } from "./page-questoes/enums/tipoDeProva";
import { Dificuldade } from "./page-questoes/enums/dificuldade";

export class FiltroDTO {
    id!: number; // O ID pode ser opcional em algumas operações
    nome!: string;
    ano!: Ano | null;
    tema!: Tema | null;
    dificuldade!: Dificuldade | null;
    tipoDeProva!: TipoDeProva | null;
    subtema!: Subtema | null;
}
  