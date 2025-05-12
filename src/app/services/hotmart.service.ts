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

    obterLinkCompraFlashcard(): Observable<string> {
        const url = `${this.apiURL}/obter-link-flashcard`;

        return this.http.get(url, { responseType: 'text' });
    
    }

}
