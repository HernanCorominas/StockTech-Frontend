export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId?: string;
  managerName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBranch {
  name: string;
  address: string;
  phone: string;
  managerId?: string;
  isActive: boolean;
}
