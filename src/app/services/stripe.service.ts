import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Plano } from "../sistema/stripePlanDTO";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class StripeService {
    apiURL: string = environment.apiURLBase + '/api/assinatura'

    constructor(private http: HttpClient){}

    async getNomePlano(): Promise<Plano> {
        
        return await this.http.get<Plano>(`${this.apiURL}/get-plan-name`).toPromise();

    }

}