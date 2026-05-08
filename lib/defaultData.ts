import { AppData } from './types'

const now = new Date()

export const defaultAppData: AppData = {
  selectedYear: now.getFullYear(),
  selectedMonth: now.getMonth() + 1,
  transactions: [],
  categories: [
    { name: '給料', type: 'income', budgetAmount: 0 },
    { name: '副業', type: 'income', budgetAmount: 0 },
    { name: 'その他収入', type: 'income', budgetAmount: 0 },
    { name: '食費', type: 'expense', budgetAmount: 0 },
    { name: '家賃', type: 'expense', budgetAmount: 0 },
    { name: '光熱費', type: 'expense', budgetAmount: 0 },
    { name: '通信費', type: 'expense', budgetAmount: 0 },
    { name: '交通費', type: 'expense', budgetAmount: 0 },
    { name: '日用品', type: 'expense', budgetAmount: 0 },
    { name: '娯楽', type: 'expense', budgetAmount: 0 },
    { name: '美容', type: 'expense', budgetAmount: 0 },
    { name: '医療', type: 'expense', budgetAmount: 0 },
    { name: 'その他', type: 'expense', budgetAmount: 0 },
  ],
  budgetSetting: {
    monthlyIncome: 0,
    allocations: [
      { category: '食費', percent: 0 },
      { category: '家賃', percent: 0 },
      { category: '光熱費', percent: 0 },
      { category: '通信費', percent: 0 },
      { category: '交通費', percent: 0 },
      { category: '日用品', percent: 0 },
      { category: '娯楽', percent: 0 },
      { category: '美容', percent: 0 },
    ],
  },
  tasks: [],
  subscriptions: [],
  savingsGoal: {
    savingsTarget: 0,
    savingsCurrent: 0,
    savingsMonthly: 0,
    emergencyMonths: 6,
    emergencyCurrent: 0,
    emergencyMonthly: 0,
  },
  investments: [
    { name: '現金', amount: 0, targetPercent: 20, monthlyTarget: 0 },
    { name: '防衛資金', amount: 0, targetPercent: 15, monthlyTarget: 0 },
    { name: 'NISA', amount: 0, targetPercent: 35, monthlyTarget: 0 },
    { name: '株式', amount: 0, targetPercent: 15, monthlyTarget: 0 },
    { name: 'iDeCo', amount: 0, targetPercent: 10, monthlyTarget: 0 },
    { name: '暗号資産', amount: 0, targetPercent: 5, monthlyTarget: 0 },
  ],
}
