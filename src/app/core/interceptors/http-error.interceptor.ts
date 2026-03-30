import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'Ocurrió un error inesperado.';
      let details = '';

      if (error.error) {
        // Handle FluentValidation ProblemDetails structure
        if (error.error.errors) {
          errorMsg = 'Error de validación';
          const errorList = Object.values(error.error.errors).flat() as string[];
          details = errorList.join('\n');
        } else if (error.error.message) {
          // Handle custom ExceptionMiddleware structure
          errorMsg = error.error.message;
          details = error.error.details || '';
        } else {
          errorMsg = error.statusText || `Error ${error.status}`;
        }
      }

      // Format a concise alert message
      const alertMsg = details ? `${errorMsg}\n\nDetalles:\n${details}` : errorMsg;
      
      toast.error(alertMsg, 6000);
      
      console.error('HTTP Error Interceptor:', error);

      return throwError(() => new Error(alertMsg));
    })
  );
};
