import { Permissao } from "./Permissao";

export const PermissaoDescricoes: Record<Permissao, string> = {
    [Permissao.ADMIN]: 'ADMIN',
    [Permissao.PROFESSOR]: 'PROFESSOR',
    [Permissao.USER]: 'ALUNO'
}