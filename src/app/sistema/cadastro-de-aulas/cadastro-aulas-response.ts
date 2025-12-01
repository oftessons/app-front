export interface CadastroAulaResponse {
    aulaId: number;
    videoId: string;
    clientPayload: {
        policy: string;
        key: string;
        'x-amz-signature': string;
        'x-amz-algorithm': string;
        'x-amz-date': string;
        'x-amz-credential': string;
        uploadLink: string;
    };
}
