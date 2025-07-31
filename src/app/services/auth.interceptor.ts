import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const isAuthRequest =
          req.url.includes('/oauth/token') || req.url.includes('/login');

        if (error.status === 401 && !isAuthRequest) {

          if (error.error && error.error.message === 'Assinatura inativa.') {
            this.router.navigate(['/planos']);

          } else {
            this.snackBar.open('Sua sessão expirou. Faça login novamente.', 'Fechar', {
              duration: 5000,
              panelClass: ['snackbar-warning']
            });

            localStorage.removeItem('access_token');

            this.router.navigate(['/login']);
          }

        } else if (error.status === 403) {
          this.snackBar.open('Acesso negado. Você não tem permissão para esta ação.', 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-error']
          });

          this.router.navigate(['/forbidden']);
        }

        return throwError(() => error);
      })
    );
  }
}
