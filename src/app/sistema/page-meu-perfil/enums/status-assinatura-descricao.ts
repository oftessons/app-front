import { StatusAssinatura } from '../enums/status-assinatura';

export const StatusAssinaturaDescricao: Record<StatusAssinatura, string> = {
    [StatusAssinatura.ATIVA]: 'Conta ativa',
    [StatusAssinatura.TESTE]: 'Período de teste',
    [StatusAssinatura.CANCELADA]: 'Conta cancelada'
}