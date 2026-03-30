export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleId: string;
  role?: Role;
  roleName?: string;
  branchId?: string;
  branchName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface UserCreateDto {
  username: string;
  password: string;
  fullName: string;
  email: string;
  roleId: string;
  branchId?: string;
}

export interface UserUpdateDto {
  fullName: string;
  email: string;
  roleId: string;
  isActive: boolean;
  branchId?: string;
}
