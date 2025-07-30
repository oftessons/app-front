import { Permissao } from "./Permissao"; 

export class Usuario {
  id!: string;
  fotoUrl!: any;
  password!: string;
  email!: string;
  telefone!: string;
  cidade!: string;
  planoId!: any;
  stripeCustomerId!: any;
  estado!: string;
  nome!: string;
  confirmPassword!: string;
  tipoUsuario!: string;
  permissao!: Permissao;  // Atualize para usar a enum Permissao
  bolsaAssinatura!: boolean;
  diasDeTeste!: number;
  dataInicioBolsa?: Date;
  tipoDeEstudante!: string;
}
