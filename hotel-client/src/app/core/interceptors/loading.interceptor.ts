import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(LoadingService);
    loadingService.setLoading(true);
    return next(req).pipe(
        delay(300),
        finalize(() => {
            loadingService.setLoading(false);
        })
    );
};
