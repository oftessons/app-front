import { Permissao } from "./Permissao"; 

export class Usuario {
  id!: string;
  fotoUrl!: any;
  username!: string;
  password!: string;
  email!: string;
  telefone!: string;
  cidade!: string;
  estado!: string;
  nome!: string;
  confirmPassword!: string;
  permissao!: Permissao;  // Atualize para usar a enum Permissao
}
