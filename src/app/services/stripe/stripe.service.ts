import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import Stripe from "stripe";
import { Plano } from "src/app/sistema/stripePlanDTO";

import { environment } from "src/environments/environment";


@Injectable({
    providedIn: 'root',
})


export class StripeService {
    private stripe: Stripe;
    constructor() {
        this.stripe = new Stripe(environment.stripeApiKey)
    }
    
    // retrieve do priceId para obtermos o nome do plano do usuário
    async getPlanByPrice(priceId: string): Promise<Plano | null> {
        const price = await this.stripe.prices.retrieve(priceId);

        const product = await this.stripe.products.retrieve(price.product as string);

        
        const plan: Plano = {
            name: product.name
        }
       
        return plan;
    } 
    
}