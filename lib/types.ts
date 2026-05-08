export interface Transaction {
  id: string
  date: string
  type: 'income' | 'expense'
  category: string
  amount: number
  memo: string
  paymentMethod: string
  note: string
}

export interface Category {
  name: string
  type: 'income' | 'expense'
  budgetAmount: number
}

export interface BudgetAllocation {
  category: string
  percent: number
}

export interface BudgetSetting {
  monthlyIncome: number
  allocations: BudgetAllocation[]
}

export interface Task {
  id: string
  typeCode: number
  name: string
  amount: number
  dueDate: string
  status: 'pending' | 'done' | 'skipped'
  priority: number
  note: string
}

export interface Subscription {
  id: string
  name: string
  debitDay: number
  amount: number
  paymentSource: string
}

export interface SavingsGoal {
  savingsTarget: number
  savingsCurrent: number
  savingsMonthly: number
  emergencyMonths: number
  emergencyCurrent: number
  emergencyMonthly: number
}

export interface Investment {
  name: string
  amount: number
  targetPercent: number
  monthlyTarget: number
}

export interface AppData {
  selectedYear: number
  selectedMonth: number
  transactions: Transaction[]
  categories: Category[]
  budgetSetting: BudgetSetting
  tasks: Task[]
  subscriptions: Subscription[]
  savingsGoal: SavingsGoal
  investments: Investment[]
}
