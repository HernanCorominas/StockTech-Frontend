export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  taxId: string;
  branchId?: string;
  branchName?: string;
  createdAt: string;
}

export interface CreateSupplier {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  taxId: string;
  branchId?: string;
}
