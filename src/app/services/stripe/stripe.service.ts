import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import Stripe from "stripe";

import { environment } from "src/environments/environment";


@Injectable({
    providedIn: 'root',
})


export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(environment.stripeApiKey)
    }
    
    // Retrieve
    async getPlanByPrice(priceId: string) {
        const price = await this.stripe.prices.retrieve(priceId);
        
        return price;
    } 
    
}