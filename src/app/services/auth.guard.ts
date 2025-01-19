import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Permissao } from '../login/Permissao';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const usuario = this.authService.getUsuarioAutenticado();
  
    // Verifica se o usuário está autenticado
    if (usuario) {
      const role = usuario.permissao;
  
      // Verifica se o usuário tem a permissão necessária
      if (role === Permissao.ADMIN || role === Permissao.PROFESSOR || role === Permissao.USER) {
        return true;
      }
    }
  
    // Caso não tenha permissão, redireciona para "forbidden"
    this.router.navigate(['/forbidden']);
    return false;
  }
  
  
  
}
