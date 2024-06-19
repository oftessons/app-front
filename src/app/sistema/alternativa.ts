import { Questao } from "./page-questoes/questao";

export class Alternativa {
    id!: number;
    descricao!: string;
    questoes!: Questao;
}