import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


import { JwtHelperService } from '@auth0/angular-jwt'
import { environment } from 'src/environments/environment';
import { Usuario } from '../login/usuario';
import { map } from 'rxjs/internal/operators/map';
import { Permissao } from '../login/Permissao';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiURL: string = environment.apiURLBase + "/api/usuarios"
  tokenURL: string = environment.apiURLBase + environment.obterTokenUrl
  clientID: string = environment.clientId;
  clientSecret: string = environment.clientSecret;
  jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(
    private http: HttpClient
  ) { }

  obterToken(){
    return localStorage.getItem('access_token');
  }

  encerrarSessao(){
    localStorage.removeItem('access_token')
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiURL}/forgot-password`, { email });
  }


  obterUsuarioAutenticadoDoBackend(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiURL}/perfil`).pipe(
      map(usuario => {
        // Presumindo que o backend retorne o role do usuário
        usuario.permissao = this.jwtHelper.decodeToken(JSON.stringify(this.obterToken())).role;
        return usuario;
      })
    );
  }
  

  atualizarUsuario(usuario: Usuario, fotoDoPerfil?: File | null): Observable<Usuario> {
    const formData: FormData = new FormData();
    formData.append('usuario', new Blob([JSON.stringify(usuario)], { type: 'application/json' }));
  
    if (fotoDoPerfil) {
      formData.append('fotoDoPerfil', fotoDoPerfil);
    }
  
    return this.http.put<Usuario>(`${this.apiURL}/update/${usuario.id}`, formData);
  }

  getUsuarioAutenticado(): Usuario | null {
    const userJson = localStorage.getItem('usuario'); // Assumindo que o usuário está salvo no localStorage
    if (userJson) {
        return JSON.parse(userJson); // Retorna o usuário como objeto
    }
    return null; // Retorna null se não houver usuário
  }

  getUserIdFromToken(): string | null {
    const token = this.obterToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken?.sub || null; // Assume que o campo 'sub' contém o ID do usuário
    }
    return null;
  }

  // Método para obter o nome do usuário autenticado no AuthService
  obterNomeUsuario(): Observable<string> {
    return this.http.get<{ nome: string }>(`${this.apiURL}/nome`).pipe(
      map(response => response.nome)  // Extrai a propriedade 'nome' do objeto retornado
    );
  }

  obterUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiURL}/buscar-usuario/${id}`);
    
  } 

  removerUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.apiURL}/delete/${usuario.id as unknown as number}`);
 
  }

  
  salvarUsuarioAutenticado(usuario: Usuario) {
    const token = this.obterToken();
    if (token) {
      const userId = this.getUserIdFromToken();

    }
  }

  isAuthenticated() : boolean {
    const token = this.obterToken();
    if(token){
      const expired = this.jwtHelper.isTokenExpired(token)

      return !expired;
    }
    return false;
  }

  isAdmin(): boolean {
    const usuarioAutenticado = this.getUsuarioAutenticado();
    return usuarioAutenticado?.permissao === Permissao.ADMIN;
  }

  salvar(usuario: Usuario, permissao: string): Observable<any> {
    const usuarioAutenticado:Usuario | null = this.getUsuarioAutenticado();
    
    if(usuarioAutenticado) {
      const permissaoUsuario = usuarioAutenticado.permissao;

      // controle do admin
      if(permissaoUsuario === Permissao.ADMIN) {
        if(permissao === Permissao.PROFESSOR) {
          return this.cadastrarProfessor(usuario);
        } else if(permissao === Permissao.USER) {
          return this.cadastrarAluno(usuario);
        }
      }

    }
      return this.cadastrarAluno(usuario);

  }
  
  private cadastrarAluno(usuario: Usuario): Observable<any> {
    return this.http.post(`${this.apiURL}/cadastro/aluno`, usuario);
  }

  // Função para cadastrar professor
  private cadastrarProfessor(usuario: Usuario): Observable<any> {
    return this.http.post(`${this.apiURL}/cadastro/professor`, usuario);
  }

  tentarLogar( username: string, password: string ) : Observable<any> {
    const params = new HttpParams()
                        .set('username', username)
                        .set('password', password)
                        .set('grant_type', 'password')

    const headers = {
      'Authorization': 'Basic ' + btoa(`${this.clientID}:${this.clientSecret}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    return this.http.post( this.tokenURL, params.toString(), { headers });
  }
}
