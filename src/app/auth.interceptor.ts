import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = (typeof window !== 'undefined' && window?.localStorage)
    ? localStorage.getItem('auth_token')
    : null;
    
  if (token) {
    req = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
  }
  
  return next(req).pipe(
    catchError(err => {
      // 只有在非登录/注册请求且不在登录页面时才处理 401
      if (err && err.status === 401 && 
          typeof window !== 'undefined' && 
          window?.localStorage &&
          !req.url.includes('/auth/') &&
          !window.location.pathname.includes('/login')) {
        try {
          localStorage.removeItem('auth_token');
        } catch {}
        
        const returnUrl = window.location.pathname;
        window.location.href = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
      }
      return throwError(() => err);
    })
  );
};