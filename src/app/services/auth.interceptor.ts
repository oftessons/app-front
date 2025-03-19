import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Verifica se o erro é 401 e se a mensagem indica assinatura inativa
        if (error.status === 401 && error.error && error.error.message === 'Assinatura inativa.') {
          // Redireciona para a rota de planos
          this.router.navigate(['/planos']);
        }
        return throwError(error);
      })
    );
  }
}
