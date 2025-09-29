import { StatusSimulado } from "./status-simulado";

export const StatusSimuladoDescricao: Record<StatusSimulado, string> = {
    [StatusSimulado.NAO_INICIADO]: 'Não Iniciado',
    [StatusSimulado.EM_ANDAMENTO]: 'Em Andamento',
    [StatusSimulado.FINALIZADO]: 'Finalizado',
    
};