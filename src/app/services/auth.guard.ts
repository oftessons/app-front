import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const usuario = this.authService.getUsuarioAutenticado();

    // Verifica se o usuário está autenticado
    if (usuario) {
      const role = usuario.permissao;

      // Verifica se o usuário tem a permissão necessária
      if (role === 'ROLE_ADMIN' || role === 'ROLE_USER' || role === 'ROLE_PROFESSOR' || role === 'ROLE_BOLSISTA') {
        return true;
      }
    }

    // Caso não tenha permissão, redireciona para "forbidden"
    this.router.navigate(['/forbidden']);
    return false;
  }



}
