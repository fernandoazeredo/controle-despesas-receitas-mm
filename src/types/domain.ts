export type UserRole =
  | 'master'
  | 'admin'
  | 'tesouraria'
  | 'alvaras'
  | 'diretoria'
  | 'contabilidade'
  | 'consulta'

export type WorkflowStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'returned'
  | 'rejected'
  | 'paid'
  | 'completed'
  | 'archived'

export interface AccountClassification {
  accountId?: string
  accountCode?: string
  accountName?: string
}

export interface FinancialComponent extends AccountClassification {
  id: string
  label: string
  percentage?: number
  amount: number
  kind: 'income' | 'expense' | 'deduction' | 'repasse'
}

export interface Receivable {
  id: string
  processNumber: string
  claimant: string
  defendant: string
  origin: 'alvara' | 'acordo'
  grossAmount: number
  components: FinancialComponent[]
  status: WorkflowStatus
  createdAt: string
}
