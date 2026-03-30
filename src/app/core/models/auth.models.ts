export interface AuthorizedBranch {
  branchId: string;
  branchName: string;
  roleName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  username: string;
  role: string;
  branchId?: string;
  authorizedBranches: AuthorizedBranch[];
  expiresAt: string;
}

export interface AuthState {
  id: string;
  username: string;
  role: string;
  fullName?: string;
  email?: string;
  permissions: string[];
  branchId?: string;
  authorizedBranches: AuthorizedBranch[];
}
