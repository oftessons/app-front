import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
    const usuario = this.authService.getUsuarioAutenticado();

    // Verifica se o usuário está autenticado e se a permissão está correta
    if (usuario && usuario.permissao === route.data.role) {
      return true;
    }

    // Redireciona para uma página de "forbidden" se a permissão não for correta
    this.router.navigate(['/forbidden']);
    return false;
  }
  
}
