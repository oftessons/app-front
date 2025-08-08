import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NavigateService {
    private readonly originSource = new BehaviorSubject<string | null>(null);
    origin$ = this.originSource.asObservable();

    constructor(private readonly router: Router) { }

    navigateTo(path: string, origin: string | null = null): Promise<boolean> {
        if (origin) {
            this.originSource.next(origin);
        }

        return this.router.navigate([path]);
    }

    navigateBack(): Promise<boolean> {
        const origin = this.originSource.getValue();
        if (origin) {
            return this.router.navigate([origin]);  
        } else {
            return this.router.navigate(['/']);  
        }
    }
}
