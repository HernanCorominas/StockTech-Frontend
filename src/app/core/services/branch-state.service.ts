import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Subject } from 'rxjs';
import { Branch, AuthorizedBranch } from '../models';
import { AuthStateService } from './auth-state.service';

@Injectable({ providedIn: 'root' })
export class BranchStateService {
  private authState = inject(AuthStateService);

  private _authorizedBranches = signal<AuthorizedBranch[]>([]);
  private _selectedBranchId = signal<string | null>(sessionStorage.getItem('globalSelectedBranchId'));
  
  readonly authorizedBranches = this._authorizedBranches.asReadonly();
  readonly selectedBranchId = this._selectedBranchId.asReadonly();
  
  hasSelection = computed(() => !!this._selectedBranchId());

  constructor() {
    // Sync branches from auth state
    effect(() => {
      const user = this.authState.currentUser();
      if (user) {
        this._authorizedBranches.set(user.authorizedBranches || []);
        
        // If no specifically selected branch, or selected branch is not in authorized list,
        // default to the one from the JWT (if present) or the first authorized one
        const currentId = this._selectedBranchId();
        const authorized = this._authorizedBranches();
        
        if (authorized.length > 0) {
          const isValid = authorized.some(b => b.branchId === currentId);
          if (!currentId || !isValid) {
            const defaultId = user.branchId || authorized[0].branchId;
            this.selectBranch(defaultId);
          }
        }
      } else {
        this._authorizedBranches.set([]);
        this._selectedBranchId.set(null);
      }
    }, { allowSignalWrites: true });
  }
  
  private branchChangedSource = new Subject<void>();
  branchChanged$ = this.branchChangedSource.asObservable();

  notifyBranchChanged() {
    this.branchChangedSource.next();
  }

  selectBranch(id: string | null) {
    this._selectedBranchId.set(id);
    if (id) {
      sessionStorage.setItem('globalSelectedBranchId', id);
    } else {
      sessionStorage.removeItem('globalSelectedBranchId');
    }
    this.notifyBranchChanged();
  }

  clearSelection() {
    this.selectBranch(null);
  }
}
