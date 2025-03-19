import { StatusAssinatura } from '../enums/status-assinatura';

export const StatusAssinaturaDescricao: Record<StatusAssinatura, string> = {
    [StatusAssinatura.ATIVA]: 'Conta ativa',
    [StatusAssinatura.CANCELADA]: 'Conta cancelada'
}