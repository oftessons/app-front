import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Permissao } from '../login/Permissao';

@Injectable({
  providedIn: 'root'
})
export class BolsaGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const usuario = this.authService.getUsuarioAutenticado();
    
    if (!usuario || usuario.permissao !== Permissao.BOLSISTA) {
      return of(true);
    }

    return this.authService.verificarBolsaExpirada().pipe(
      tap(expirada => {
        if (expirada) {
          
          this.router.navigate(['/planos'], { 
            queryParams: { 
              expired: true,
              message: 'Sua bolsa expirou. Por favor, escolha um plano para continuar.'
            } 
          });
        }
      }),
      map(expirada => !expirada) 
    );
  }
}