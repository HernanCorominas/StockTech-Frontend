export interface Client {
  id: string;
  name: string;
  document: string;
  clientType: number;
  clientTypeName: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  branchId?: string;
  createdAt: string;
}

export interface CreateClient {
  name: string;
  document: string;
  clientType: number;
  email?: string;
  phone?: string;
  address?: string;
  branchId?: string;
}
