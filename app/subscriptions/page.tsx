'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Subscription } from '@/lib/types'
import AmountInput from '@/components/AmountInput'

function getStatus(debitDay: number): { label: string; color: string } {
  const today = new Date().getDate()
  const diff = debitDay - today
  if (diff < 0) return { label: '支払済', color: 'bg-gray-100 text-gray-400' }
  if (diff === 0) return { label: '今日！', color: 'bg-peach-200 text-peach-500 animate-pulse font-bold' }
  if (diff <= 3) return { label: `あと${diff}日`, color: 'bg-lemon-200 text-yellow-700 font-bold' }
  return { label: `${debitDay}日`, color: 'bg-sky-100 text-sky-500' }
}

function newSub(): Partial<Subscription> {
  return { debitDay: 1, amount: 0, paymentSource: '銀行口座' }
}

const PAYMENT_SOURCES = ['銀行口座', 'クレジット', 'PayPay', 'その他']

export default function SubscriptionsPage() {
  const { data, dispatch } = useStore()
  const [editSub, setEditSub] = useState<Partial<Subscription> | null>(null)

  const totalMonthly = data.subscriptions.reduce((s, sub) => s + sub.amount, 0)
  const monthlyIncome = data.budgetSetting.monthlyIncome
  const remainingIncome = monthlyIncome - totalMonthly
  const fixedRate = monthlyIncome > 0 ? totalMonthly / monthlyIncome * 100 : 0

  const sorted = [...data.subscriptions].sort((a, b) => a.debitDay - b.debitDay)

  const saveSub = () => {
    if (!editSub?.name || !editSub.debitDay || editSub.amount === undefined) return
    const sub: Subscription = {
      id: editSub.id || Date.now().toString(),
      name: editSub.name,
      debitDay: editSub.debitDay,
      amount: editSub.amount,
      paymentSource: editSub.paymentSource || '銀行口座',
    }
    if (editSub.id) {
      dispatch({ type: 'UPDATE_SUBSCRIPTION', sub })
    } else {
      dispatch({ type: 'ADD_SUBSCRIPTION', sub })
    }
    setEditSub(null)
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-xl font-bold text-lavender-500">🔔 引落予約</h2>
        <button onClick={() => setEditSub(newSub())}
          className="bg-lavender-300 hover:bg-lavender-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          ＋ 追加
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="card border-2 border-lavender-200 text-center py-3">
          <p className="text-xs text-gray-500">固定費合計</p>
          <p className="text-lg font-bold text-lavender-400">{totalMonthly.toLocaleString()}<span className="text-xs text-gray-500">円</span></p>
        </div>
        <div className="card border-2 border-mint-200 text-center py-3">
          <p className="text-xs text-gray-500">残り収入</p>
          <p className={`text-lg font-bold ${remainingIncome >= 0 ? 'text-mint-500' : 'text-pink-400'}`}>
            {remainingIncome.toLocaleString()}<span className="text-xs text-gray-500">円</span>
          </p>
        </div>
        <div className="card border-2 border-peach-200 text-center py-3">
          <p className="text-xs text-gray-500">固定費率</p>
          <p className={`text-lg font-bold ${fixedRate <= 50 ? 'text-mint-500' : 'text-pink-400'}`}>
            {fixedRate.toFixed(1)}<span className="text-xs text-gray-500">%</span>
          </p>
          <p className="text-[10px] text-gray-400">{fixedRate <= 50 ? '✓ 良好' : '⚠ 高め'}</p>
        </div>
      </div>

      {/* Subscription list */}
      <div className="card">
        <div className="space-y-2">
          {sorted.map(sub => {
            const status = getStatus(sub.debitDay)
            return (
              <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-lavender-50 transition-colors cursor-pointer"
                onClick={() => setEditSub(sub)}>
                <div className="w-10 h-10 rounded-full bg-lavender-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-lavender-400">{sub.debitDay}日</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-700">{sub.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>💳 {sub.paymentSource}</span>
                    <span>必要残高: {(sub.amount * 1.1).toLocaleString()}円以上</span>
                  </div>
                </div>
                <span className="text-base font-bold text-lavender-400 flex-shrink-0">
                  {sub.amount.toLocaleString()}<span className="text-xs text-gray-400">円</span>
                </span>
                <button
                  onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_SUBSCRIPTION', id: sub.id }) }}
                  className="text-gray-300 hover:text-pink-400 flex-shrink-0">✕</button>
              </div>
            )
          })}
          {data.subscriptions.length === 0 && (
            <p className="text-center text-gray-400 py-6">固定費・サブスクを追加してください</p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-lavender-100 flex justify-between items-center">
          <span className="text-xs text-gray-500">合計 {data.subscriptions.length}件</span>
          <span className="text-sm font-bold text-lavender-400">{totalMonthly.toLocaleString()}円 / 月</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="card mt-4">
        <h3 className="text-sm font-bold text-gray-600 mb-3">📅 今月の引落スケジュール</h3>
        <div className="space-y-1">
          {sorted.map(sub => {
            const status = getStatus(sub.debitDay)
            const isPaid = getStatus(sub.debitDay).label === '支払済'
            return (
              <div key={sub.id} className={`flex items-center gap-2 text-xs ${isPaid ? 'opacity-50' : ''}`}>
                <span className="w-8 text-right text-gray-500">{sub.debitDay}日</span>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isPaid ? 'bg-gray-300' : 'bg-lavender-400'}`} />
                <span className="flex-1">{sub.name}</span>
                <span className={`px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                <span className="text-lavender-400 font-bold">{sub.amount.toLocaleString()}円</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {editSub && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm">
            <h3 className="text-sm font-bold text-lavender-400 mb-4">{editSub.id ? '編集' : '引落予約を追加'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">項目名 *</label>
                <input type="text" placeholder="例: 家賃・Netflix" value={editSub.name || ''} onChange={e => setEditSub({ ...editSub, name: e.target.value })} className="input-cell" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">引落日 (1-31) *</label>
                  <input type="number" title="引落日" min={1} max={31} value={editSub.debitDay || 1} onChange={e => setEditSub({ ...editSub, debitDay: +e.target.value })} className="input-cell w-20 text-center" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">金額 *</label>
                  <AmountInput value={editSub.amount || 0} onChange={v => setEditSub({ ...editSub, amount: v })} required />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">支払元</label>
                <select title="支払元" value={editSub.paymentSource || '銀行口座'} onChange={e => setEditSub({ ...editSub, paymentSource: e.target.value })} className="input-cell">
                  {PAYMENT_SOURCES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveSub} className="flex-1 bg-lavender-300 hover:bg-lavender-400 text-white py-2 rounded-xl text-sm font-bold">保存</button>
              {editSub.id && (
                <button onClick={() => { dispatch({ type: 'DELETE_SUBSCRIPTION', id: editSub.id! }); setEditSub(null) }}
                  className="px-3 bg-red-50 text-red-400 rounded-xl text-sm">削除</button>
              )}
              <button onClick={() => setEditSub(null)} className="px-3 bg-gray-100 text-gray-500 rounded-xl text-sm">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
