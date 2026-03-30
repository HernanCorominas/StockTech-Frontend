export interface AuditLog {
  id: string;
  entityName: string;
  action: string;
  entityId: string;
  oldValues?: string;
  newValues?: string;
  changedColumns?: string;
  userId?: string;
  username?: string;
  timestamp: string;
  branchId?: string;
  branchName?: string;
  tableName?: string;
}
