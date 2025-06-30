export interface ApiResponse<T> {
    httpStatusCode: number;
    httpStatusMessage: string;
    data: T;
}