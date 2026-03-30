export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCategory {
  name: string;
  description?: string;
}

export interface UpdateCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}
