import { StatusAssinatura } from '../enums/status-assinatura';

export const StatusAssinaturaDescricao: Record<StatusAssinatura, string> = {
    [StatusAssinatura.ATIVA]: 'Ativo',
    [StatusAssinatura.CANCELADA]: 'Cancelada'
}