import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(LoadingService);

    // Start loading
    loadingService.setLoading(true);

    return next(req).pipe(
        // Force a 0.3s delay as requested, then stop loading
        delay(300),
        finalize(() => {
            loadingService.setLoading(false);
        })
    );
};
