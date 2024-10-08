import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const token = localStorage.getItem('access_token');

    const url = request.url;

    if( token && !url.endsWith('/oauth/token') ){
      request = request.clone({
        setHeaders : {
          Authorization: 'Bearer ' + token
        }
      })
    }

    return next.handle(request);
  }
}
