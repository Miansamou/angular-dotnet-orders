import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const t = localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
  if (!t) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }));
};
