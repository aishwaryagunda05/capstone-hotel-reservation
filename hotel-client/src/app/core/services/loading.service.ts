import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private _loading = signal<boolean>(false);
    readonly loading = this._loading.asReadonly();

    setLoading(state: boolean) {
        this._loading.set(state);
    }
}
