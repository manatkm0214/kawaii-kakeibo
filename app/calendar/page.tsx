'use client'
import { useState } from 'react'
import { useStore, useMonthTransactions } from '@/lib/store'
import { Transaction } from '@/lib/types'
import AmountInput from '@/components/AmountInput'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay()
}

export default function CalendarPage() {
  const { data, dispatch } = useStore()
  const txs = useMonthTransactions()
  const { selectedYear: year, selectedMonth: month } = data
  const [editTx, setEditTx] = useState<Partial<Transaction> | null>(null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const weeks = Math.ceil((daysInMonth + firstDay) / 7)

  const dayTxs = (day: number) => txs.filter(t => {
    const d = parseInt(t.date.split('/')[2] || '0')
    return d === day
  })

  const dayIncome = (day: number) => dayTxs(day).filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const dayExpense = (day: number) => dayTxs(day).filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalCount = txs.length

  const expenseCats = data.categories.filter(c => c.type === 'expense').map(c => c.name)
  const incomeCats = data.categories.filter(c => c.type === 'income').map(c => c.name)

  const saveTx = () => {
    if (!editTx?.date || !editTx.category || !editTx.amount) return
    const tx: Transaction = {
      id: editTx.id || Date.now().toString(),
      date: editTx.date,
      type: editTx.type || 'expense',
      category: editTx.category,
      amount: editTx.amount,
      memo: editTx.memo || '',
      paymentMethod: editTx.paymentMethod || '',
      note: editTx.note || '',
    }
    if (editTx.id) {
      dispatch({ type: 'UPDATE_TRANSACTION', tx })
    } else {
      dispatch({ type: 'ADD_TRANSACTION', tx })
    }
    setEditTx(null)
  }

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === day

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="p-4 lg:p-6 max-w-4xl">
      <h2 className="text-xl font-bold text-sky-500 mb-4">📅 カレンダー</h2>

      {/* Monthly summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card bg-mint-50 border border-mint-200 text-center py-2">
          <p className="text-xs text-gray-500">月収入</p>
          <p className="text-sm font-bold text-mint-500">{totalIncome.toLocaleString()}円</p>
        </div>
        <div className="card bg-pink-50 border border-pink-200 text-center py-2">
          <p className="text-xs text-gray-500">月支出</p>
          <p className="text-sm font-bold text-pink-400">{totalExpense.toLocaleString()}円</p>
        </div>
        <div className="card border text-center py-2">
          <p className="text-xs text-gray-500">取引件数</p>
          <p className="text-sm font-bold text-gray-700">{totalCount}件</p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card mb-5 overflow-x-auto">
        <div className="grid grid-cols-7 gap-px bg-pink-100 rounded-xl overflow-hidden min-w-[560px]">
          {weekDays.map((d, i) => (
            <div key={d} className={`text-center text-xs py-2 font-bold bg-white ${i === 0 ? 'text-pink-400' : i === 6 ? 'text-sky-400' : 'text-gray-500'}`}>
              {d}
            </div>
          ))}
          {Array.from({ length: weeks * 7 }).map((_, idx) => {
            const day = idx - firstDay + 1
            const valid = day >= 1 && day <= daysInMonth
            const inc = valid ? dayIncome(day) : 0
            const exp = valid ? dayExpense(day) : 0
            const dow = idx % 7
            return (
              <div
                key={idx}
                onClick={() => valid && setEditTx({ date: `${year}/${month}/${day}`, type: 'expense' })}
                className={`bg-white p-1 min-h-[64px] text-xs cursor-pointer hover:bg-pink-50 transition-colors
                  ${!valid ? 'opacity-0 pointer-events-none' : ''}
                  ${isToday(day) ? 'ring-2 ring-pink-300' : ''}`}
              >
                {valid && (
                  <>
                    <div className={`text-right font-bold mb-1 ${dow === 0 ? 'text-pink-400' : dow === 6 ? 'text-sky-400' : 'text-gray-600'} ${isToday(day) ? 'text-pink-500' : ''}`}>
                      {day}
                    </div>
                    {inc > 0 && <div className="text-mint-500 truncate">+{(inc / 1000).toFixed(0)}k</div>}
                    {exp > 0 && <div className="text-pink-400 truncate">-{(exp / 1000).toFixed(0)}k</div>}
                  </>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">日付をクリックして取引を追加 ／ 緑=収入、ピンク=支出</p>
      </div>

      {/* Quick input sections */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Income */}
        <div className="card border-2 border-mint-200">
          <h3 className="text-sm font-bold text-mint-500 mb-3">💚 収入記入欄</h3>
          <div className="space-y-2">
            {txs.filter(t => t.type === 'income').slice(0, 8).map(tx => (
              <div key={tx.id} className="flex items-center gap-2 text-xs bg-mint-50 rounded-lg px-2 py-1">
                <span className="text-gray-500">{tx.date.split('/').slice(1).join('/')}</span>
                <span className="flex-1 truncate">{tx.category}</span>
                <span className="font-bold text-mint-500">+{tx.amount.toLocaleString()}</span>
                <button onClick={() => setEditTx(tx)} className="text-gray-400 hover:text-sky-400">✏️</button>
              </div>
            ))}
            <button
              onClick={() => setEditTx({ date: `${year}/${month}/1`, type: 'income' })}
              className="w-full text-xs py-1.5 border-2 border-dashed border-mint-300 text-mint-400 rounded-lg hover:bg-mint-50 transition-colors"
            >
              + 収入を追加
            </button>
          </div>
        </div>

        {/* Fixed expenses */}
        <div className="card border-2 border-sky-200">
          <h3 className="text-sm font-bold text-sky-500 mb-3">🏠 固定費記入欄</h3>
          <div className="space-y-2">
            {txs.filter(t => t.type === 'expense' && ['家賃', '光熱費', '通信費', '保険'].includes(t.category)).slice(0, 10).map(tx => (
              <div key={tx.id} className="flex items-center gap-2 text-xs bg-sky-50 rounded-lg px-2 py-1">
                <span className="text-gray-500">{tx.date.split('/').slice(1).join('/')}</span>
                <span className="flex-1 truncate">{tx.category}</span>
                <span className="font-bold text-sky-500">-{tx.amount.toLocaleString()}</span>
                <button onClick={() => setEditTx(tx)} className="text-gray-400 hover:text-sky-400">✏️</button>
              </div>
            ))}
            <button
              onClick={() => setEditTx({ date: `${year}/${month}/1`, type: 'expense', category: '家賃' })}
              className="w-full text-xs py-1.5 border-2 border-dashed border-sky-300 text-sky-400 rounded-lg hover:bg-sky-50 transition-colors"
            >
              + 固定費を追加
            </button>
          </div>
        </div>

        {/* Variable expenses */}
        <div className="card border-2 border-pink-200">
          <h3 className="text-sm font-bold text-pink-400 mb-3">🛒 変動費記入欄</h3>
          <div className="space-y-2">
            {txs.filter(t => t.type === 'expense' && !['家賃', '光熱費', '通信費', '保険'].includes(t.category)).slice(0, 15).map(tx => (
              <div key={tx.id} className="flex items-center gap-2 text-xs bg-pink-50 rounded-lg px-2 py-1">
                <span className="text-gray-500">{tx.date.split('/').slice(1).join('/')}</span>
                <span className="flex-1 truncate">{tx.category}</span>
                <span className="font-bold text-pink-400">-{tx.amount.toLocaleString()}</span>
                <button onClick={() => setEditTx(tx)} className="text-gray-400 hover:text-pink-400">✏️</button>
              </div>
            ))}
            <button
              onClick={() => setEditTx({ date: `${year}/${month}/1`, type: 'expense' })}
              className="w-full text-xs py-1.5 border-2 border-dashed border-pink-300 text-pink-400 rounded-lg hover:bg-pink-50 transition-colors"
            >
              + 変動費を追加
            </button>
          </div>
        </div>

        {/* Savings */}
        <div className="card border-2 border-lavender-200">
          <h3 className="text-sm font-bold text-lavender-400 mb-3">🐷 貯金記入欄</h3>
          <div className="space-y-2">
            {txs.filter(t => t.category === '先取貯金' || t.memo?.includes('貯金')).slice(0, 8).map(tx => (
              <div key={tx.id} className="flex items-center gap-2 text-xs bg-lavender-50 rounded-lg px-2 py-1">
                <span className="text-gray-500">{tx.date.split('/').slice(1).join('/')}</span>
                <span className="flex-1 truncate">{tx.category}</span>
                <span className="font-bold text-lavender-500">{tx.amount.toLocaleString()}</span>
                <button onClick={() => setEditTx(tx)} className="text-gray-400 hover:text-lavender-400">✏️</button>
              </div>
            ))}
            <button
              onClick={() => setEditTx({ date: `${year}/${month}/1`, type: 'expense', category: '先取貯金' })}
              className="w-full text-xs py-1.5 border-2 border-dashed border-lavender-300 text-lavender-400 rounded-lg hover:bg-lavender-50 transition-colors"
            >
              + 貯金を記録
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {editTx && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm">
            <h3 className="text-sm font-bold text-pink-400 mb-4">{editTx.id ? '取引を編集' : '取引を追加'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">日付</label>
                <input type="text" placeholder="yyyy/m/d" value={editTx.date || ''} onChange={e => setEditTx({ ...editTx, date: e.target.value })} className="input-cell" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">種別</label>
                <select value={editTx.type || 'expense'} onChange={e => setEditTx({ ...editTx, type: e.target.value as 'income' | 'expense' })} className="input-cell">
                  <option value="expense">支出</option>
                  <option value="income">収入</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">カテゴリ</label>
                <select value={editTx.category || ''} onChange={e => setEditTx({ ...editTx, category: e.target.value })} className="input-cell">
                  <option value="">選択してください</option>
                  {(editTx.type === 'income' ? incomeCats : expenseCats).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">金額</label>
                <AmountInput value={editTx.amount || 0} onChange={v => setEditTx({ ...editTx, amount: v })} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">メモ</label>
                <input type="text" value={editTx.memo || ''} onChange={e => setEditTx({ ...editTx, memo: e.target.value })} className="input-cell" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveTx} className="flex-1 bg-pink-300 hover:bg-pink-400 text-white py-2 rounded-xl text-sm font-bold">保存</button>
              {editTx.id && (
                <button onClick={() => { dispatch({ type: 'DELETE_TRANSACTION', id: editTx.id! }); setEditTx(null) }}
                  className="px-3 bg-gray-100 hover:bg-red-100 text-red-400 rounded-xl text-sm">削除</button>
              )}
              <button onClick={() => setEditTx(null)} className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl text-sm">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
