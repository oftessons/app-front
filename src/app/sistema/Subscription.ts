export class Subscription {
    id!: string;
    stripeId!: string;
    createdAt!: Date;   
    updatedAt!: Date;
    planoId!: string;
    subscriptionStatus!: string;
    currentPeriodStart!: string;
    currentPeriodEnd!: string;
    usuarioId!: string;
}