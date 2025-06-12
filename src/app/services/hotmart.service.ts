import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root',
})
export class HotmartService {
    apiURL: string = environment.apiURLBase + '/api/hotmart';

    constructor(private http: HttpClient) {}

    obterLinkCompraFlashcard(planoId: String): Observable<any> {
        const url = `${this.apiURL}/obter-link-pagamento?planoId=${planoId}`;

        return this.http.get(url);
    
    }

}
