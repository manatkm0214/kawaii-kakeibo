'use client'
import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { AppData, Transaction, Task, Subscription, Investment, Category, BudgetSetting, SavingsGoal } from './types'
import { defaultAppData } from './defaultData'

type Action =
  | { type: 'LOAD'; data: AppData }
  | { type: 'SET_MONTH'; year: number; month: number }
  | { type: 'ADD_TRANSACTION'; tx: Transaction }
  | { type: 'UPDATE_TRANSACTION'; tx: Transaction }
  | { type: 'DELETE_TRANSACTION'; id: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'ADD_SUBSCRIPTION'; sub: Subscription }
  | { type: 'UPDATE_SUBSCRIPTION'; sub: Subscription }
  | { type: 'DELETE_SUBSCRIPTION'; id: string }
  | { type: 'UPDATE_BUDGET'; setting: BudgetSetting }
  | { type: 'UPDATE_SAVINGS'; goal: SavingsGoal }
  | { type: 'UPDATE_INVESTMENTS'; investments: Investment[] }
  | { type: 'UPDATE_CATEGORIES'; categories: Category[] }

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'LOAD': return action.data
    case 'SET_MONTH': return { ...state, selectedYear: action.year, selectedMonth: action.month }
    case 'ADD_TRANSACTION': return { ...state, transactions: [...state.transactions, action.tx] }
    case 'UPDATE_TRANSACTION': return { ...state, transactions: state.transactions.map(t => t.id === action.tx.id ? action.tx : t) }
    case 'DELETE_TRANSACTION': return { ...state, transactions: state.transactions.filter(t => t.id !== action.id) }
    case 'ADD_TASK': return { ...state, tasks: [...state.tasks, action.task] }
    case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) }
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) }
    case 'ADD_SUBSCRIPTION': return { ...state, subscriptions: [...state.subscriptions, action.sub] }
    case 'UPDATE_SUBSCRIPTION': return { ...state, subscriptions: state.subscriptions.map(s => s.id === action.sub.id ? action.sub : s) }
    case 'DELETE_SUBSCRIPTION': return { ...state, subscriptions: state.subscriptions.filter(s => s.id !== action.id) }
    case 'UPDATE_BUDGET': return { ...state, budgetSetting: action.setting }
    case 'UPDATE_SAVINGS': return { ...state, savingsGoal: action.goal }
    case 'UPDATE_INVESTMENTS': return { ...state, investments: action.investments }
    case 'UPDATE_CATEGORIES': return { ...state, categories: action.categories }
    default: return state
  }
}

interface StoreContextType {
  data: AppData
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, defaultAppData)

  useEffect(() => {
    const saved = localStorage.getItem('kawaii-kakeibo')
    if (saved) {
      try {
        dispatch({ type: 'LOAD', data: JSON.parse(saved) })
      } catch { /* ignore corrupted data */ }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('kawaii-kakeibo', JSON.stringify(data))
  }, [data])

  return <StoreContext.Provider value={{ data, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function useMonthTransactions() {
  const { data } = useStore()
  return data.transactions.filter(tx => {
    const [y, m] = tx.date.split('/').map(Number)
    return y === data.selectedYear && m === data.selectedMonth
  })
}

export function useMonthSummary() {
  const txs = useMonthTransactions()
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense
  const savingsRate = income > 0 ? (balance / income) * 100 : 0
  return { income, expense, balance, savingsRate }
}
