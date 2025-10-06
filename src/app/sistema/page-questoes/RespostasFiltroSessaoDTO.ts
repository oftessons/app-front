import { RespostaDTO } from "../RespostaDTO";

export interface RespostasFiltroSessaoDTO {
    questoesIds: number[];
    idUsuario: number;
    respostas: Array<RespostaDTO>;
}
