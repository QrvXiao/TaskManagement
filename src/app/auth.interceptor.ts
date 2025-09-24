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
      // 统一处理 401：清除 token 并跳转到登录页（在浏览器环境下）
      if (err && err.status === 401 && typeof window !== 'undefined' && window?.localStorage) {
        try {
          localStorage.removeItem('auth_token');
        } catch {}
        const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
        // 使用 location.href 以避免在 SSR 环境中依赖 Angular Router
        window.location.href = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
      }
      return throwError(() => err);
    })
  );
};