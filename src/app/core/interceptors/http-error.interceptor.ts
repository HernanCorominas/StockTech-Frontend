import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
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
      
      // We use a basic window.alert for now, but this could be replaced by a Toast/Snackbar service
      alert(alertMsg);
      console.error('HTTP Error Interceptor:', error);

      return throwError(() => new Error(alertMsg));
    })
  );
};
