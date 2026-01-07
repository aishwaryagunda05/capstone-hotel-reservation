import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  if (typeof window !== 'undefined') {

    const token = localStorage.getItem('token');

    if (token) {
      console.log('Attaching Token:', token);
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    } else {
      console.warn('No token found in localStorage');
    }
  }
  return next(req);
};
