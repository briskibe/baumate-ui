import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * HTTP Interceptor that adds X-User-Id header to all outgoing requests
 * This header is used by the fake backend to authenticate and authorize requests
 */
export const authHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const user = authService.user;

  // If user is authenticated, add X-User-Id header
  if (user?.id) {
    const clonedReq = req.clone({
      setHeaders: {
        'X-User-Id': user.id
      }
    });
    return next(clonedReq);
  }

  // If no user, proceed without adding the header
  return next(req);
};
