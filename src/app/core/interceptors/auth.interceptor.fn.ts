import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';
import { BranchStateService } from '../services/branch-state.service';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const branchState = inject(BranchStateService);
  
  const token = authState.getToken();
  const selectedBranchId = branchState.selectedBranchId();

  let headers = req.headers;
  
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (selectedBranchId) {
    headers = headers.set('X-Branch-Id', selectedBranchId);
  }

  const authReq = req.clone({ headers });
  return next(authReq);
};
