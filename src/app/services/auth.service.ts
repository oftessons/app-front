import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';


import { JwtHelperService } from '@auth0/angular-jwt'
import { environment } from 'src/environments/environment';
import { Usuario } from '../login/usuario';
import { map } from 'rxjs/internal/operators/map';
import { Permissao } from '../login/Permissao';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { LoginDTO } from '../sistema/LoginDTO';
import { MFACodigoDTO } from '../sistema/MFACodigoDTO';
import { UsuarioDadosAssinatura } from '../login/usuario-dados-assinatura';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiURL: string = environment.apiURLBase + "/api/usuarios"
  tokenURL: string = environment.apiURLBase + environment.obterTokenUrl
  clientID: string = environment.clientId;
  clientSecret: string = environment.clientSecret;
  jwtHelper: JwtHelperService = new JwtHelperService();
  private cachePermissao$: Observable<any> | null = null;


  constructor(
    private http: HttpClient
  ) { }

  obterToken() {
    return localStorage.getItem('access_token');
  }

  encerrarSessao() {
    localStorage.removeItem('access_token')
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiURL}/recuperar-senha?email=${email}`, {});
  }

  resetPassword(token: string, newPassword: string) {
    const body = { newPassword: newPassword };

    return this.http.post(`${this.apiURL}/reset-password?token=${token}`, body, {
      headers: { 'Content-Type': 'application/json' }
    });
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

  verificarPermissao(): Observable<any> {
    if (this.cachePermissao$) {
      return this.cachePermissao$;
    }

    this.cachePermissao$ = this.http.get<UsuarioDadosAssinatura>(`${this.apiURL}/obter-dados-assinatura`).pipe(
      map(dados => ({
        accessGranted: dados.subscriptionStatus !== 'partial',
        message: dados.subscriptionStatus === 'partial' ? 'Seu plano atual não permite acesso a este conteúdo.' : null
      })),

      shareReplay(1),
      catchError(err => {
        this.cachePermissao$ = null;
        return throwError(() => err);
      })
    );

    return this.cachePermissao$;
  }


  obterLinkFlashcard(): Observable<any> {
    return this.http.get<UsuarioDadosAssinatura>(`${this.apiURL}/obter-dados-assinatura`).pipe(
      map(dados => {
        return { linkFlashcard: dados.urlFlashcard };
      })
    )

  }

  atualizarUsuario(usuario: Usuario, fotoDoPerfil?: File | null): Observable<Usuario> {
    const formData: FormData = new FormData();
    formData.append('usuario', new Blob([JSON.stringify(usuario)], { type: 'application/json' }));

    if (fotoDoPerfil) {
      formData.append('fotoDoPerfil', fotoDoPerfil);
    }

    return this.http.put<Usuario>(`${this.apiURL}/update/${usuario.id}`, formData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 422) {
            return throwError('Já existe um usuário com este username na nossa base de dados. Tente outro');
          }
          return throwError("O servidor não está funcionando corretamente.");
        })
      );
  }

  atualizarDadosParciais(userId: string, dados: Partial<Usuario>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiURL}/update-parcial/${userId}`, dados)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao atualizar dados parciais:', error);
          return throwError("Erro ao atualizar dados. Por favor, tente novamente.");
        })
      );
  }

  removerUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/delete/${id}`);
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


  salvarUsuarioAutenticado(usuario: Usuario) {
    const token = this.obterToken();
    if (token) {
      const userId = this.getUserIdFromToken();

    }
  }

  isAuthenticated(): boolean {
    const token = this.obterToken();
    if (token) {
      const expired = this.jwtHelper.isTokenExpired(token)

      return !expired;
    }
    return false;
  }

  salvar(usuario: Usuario, perm: Permissao): Observable<any> {
    const { permissao: userPermissao } = this.getUsuarioAutenticado() || {};

    let request: Observable<any>;
    if (userPermissao === Permissao.ADMIN && perm === Permissao.PROFESSOR.valueOf()) {
      request = this.cadastrarProfessor(usuario);
    } else if (userPermissao === Permissao.ADMIN && perm === Permissao.BOLSISTA.valueOf()) {
      request = this.cadastrarBolsista(usuario);
    } else {
      request = this.cadastrarAluno(usuario);
    }

    return request.pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 422) {
          return throwError('Email já cadastrado na base de dados');
        }
        return throwError(error);
      })
    );
  }

  private cadastrarAluno(usuario: Usuario): Observable<any> {
    return this.http.post(`${this.apiURL}/cadastro/USER`, usuario)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 422) {
            return throwError('Email já cadastrado na base de dados');
          }
          return throwError("O servidor não está funcionando corretamente.");
        })
      );
  }

  private cadastrarBolsista(usuario: Usuario): Observable<any> {
    return this.http.post(`${this.apiURL}/cadastro/BOLSISTA`, usuario)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 422) {
            return throwError('Email já cadastrado na base de dados');
          }
          return throwError("O servidor não está funcionando corretamente.");
        })
      );
  }

  private cadastrarProfessor(usuario: Usuario): Observable<any> {
    return this.http.post(`${this.apiURL}/cadastro/PROFESSOR`, usuario)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 422) {
            return throwError('Email já cadastrado na base de dados');
          }
          return throwError("O servidor não está funcionando corretamente.");
        })
      );
  }

  public visualizarAlunos(): Observable<Usuario[] | null> {
    return this.http.get<Usuario[]>(`${this.apiURL}/visualizar/PROFESSOR`, { observe: 'response' }).pipe(
      map((response) => {
        if (response.status === 204) {
          return null;
        }
        return response.body || null;
      }),
      catchError((error: HttpErrorResponse) => {

        return throwError(
          'Erro ao visualizar alunos. Por favor, tente novamente.'
        );
      })
    );
  }

  public visualizarAlunosMentoria(): Observable<Usuario[] | null> {
    return this.http.get<Usuario[]>(`${this.apiURL}/mentoria/visualizar-alunos`, { observe: 'response' }).pipe(
      map((response) => {
        if (response.status === 204) {
          return null;
        }
        return response.body || null;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao visualizar alunos de mentoria: ', error);
        return throwError(
          'Erro ao visualizar alunos de mentoria. Por favor, tente novamente.'
        );
      })
    );
  }

  public visualizarUsuarios(): Observable<Usuario[] | null> {
    return this.http.get<Usuario[]>(`${this.apiURL}/visualizar/ADMIN`, { observe: 'response' }).pipe(
      map((response) => {
        if (response.status === 204) {
          return null;
        }
        return response.body || null;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao visualizar os usuários: ', error);
        return throwError(
          'Erro ao visualizar os usuários. Por favor, tente novamente.'
        )
      })
    )
  }


  public visualizarUsuarioPorId(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiURL}/visualizarUsuario/${id}`)
  }

  send2FACode(loginData: LoginDTO): Observable<HttpResponse<any>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiURL}/2fa/send-code`, loginData, { headers, observe: 'response' });
  }

  verify2FACode(codeMFA: MFACodigoDTO): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<boolean>(`${this.apiURL}/2fa/verify-code`, codeMFA, { headers });
  }

  tentarLogar(username: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('grant_type', 'password')


    const headers = {
      'Authorization': 'Basic ' + btoa(`${this.clientID}:${this.clientSecret}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    return this.http.post(this.tokenURL, params.toString(), { headers });
  }

  verificarBolsaExpirada(): Observable<boolean> {
    return this.http.get<{ expirada: boolean }>(`${this.apiURL}/verificar-bolsa-expirada`).pipe(
      map(response => response.expirada),
      catchError(error => {
        console.error('Erro ao verificar expiração da bolsa:', error);
        // Se houver um erro, assume que a bolsa está expirada para redirecionar o usuário por segurança
        return of(true);
      })
    );
  }
}
