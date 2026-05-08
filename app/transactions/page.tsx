'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { Transaction } from '@/lib/types'

const PAYMENT_METHODS = ['現金', 'クレジット', '口座引落', 'ICカード', '銀行振込', 'PayPay', 'その他']

function newTx(): Partial<Transaction> {
  const today = new Date()
  return { date: `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`, type: 'expense', memo: '', paymentMethod: '', note: '' }
}

export default function TransactionsPage() {
  const { data, dispatch } = useStore()
  const [editTx, setEditTx] = useState<Partial<Transaction> | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')
  const [sortDesc, setSortDesc] = useState(true)

  const expenseCats = data.categories.filter(c => c.type === 'expense').map(c => c.name)
  const incomeCats = data.categories.filter(c => c.type === 'income').map(c => c.name)
  const allCats = data.categories.map(c => c.name)

  const filtered = useMemo(() => {
    return data.transactions
      .filter(t => filterType === 'all' || t.type === filterType)
      .filter(t => !filterCat || t.category === filterCat)
      .filter(t => !search || t.memo.includes(search) || t.category.includes(search) || t.note.includes(search))
      .sort((a, b) => {
        const da = a.date.split('/').map(Number)
        const db = b.date.split('/').map(Number)
        const va = da[0] * 10000 + da[1] * 100 + (da[2] || 0)
        const vb = db[0] * 10000 + db[1] * 100 + (db[2] || 0)
        return sortDesc ? vb - va : va - vb
      })
  }, [data.transactions, filterType, filterCat, search, sortDesc])

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

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

  return (
    <div className="p-4 lg:p-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-xl font-bold text-mint-500">📝 取引履歴</h2>
        <button onClick={() => setEditTx(newTx())}
          className="bg-pink-300 hover:bg-pink-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          ＋ 取引を追加
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card bg-mint-50 border border-mint-200 text-center py-2">
          <p className="text-xs text-gray-500">収入合計</p>
          <p className="text-sm font-bold text-mint-500">+{totalIncome.toLocaleString()}</p>
        </div>
        <div className="card bg-pink-50 border border-pink-200 text-center py-2">
          <p className="text-xs text-gray-500">支出合計</p>
          <p className="text-sm font-bold text-pink-400">-{totalExpense.toLocaleString()}</p>
        </div>
        <div className="card text-center py-2">
          <p className="text-xs text-gray-500">件数</p>
          <p className="text-sm font-bold text-gray-700">{filtered.length}件</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="🔍 メモ・カテゴリで検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-cell flex-1 min-w-40"
          />
          <select value={filterType} onChange={e => setFilterType(e.target.value as 'all' | 'income' | 'expense')} className="input-cell w-28">
            <option value="all">全て</option>
            <option value="income">収入</option>
            <option value="expense">支出</option>
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input-cell w-32">
            <option value="">全カテゴリ</option>
            {allCats.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => setSortDesc(!sortDesc)} className="px-3 py-1 bg-lavender-100 text-lavender-400 rounded-xl text-xs font-bold">
            日付 {sortDesc ? '↓新' : '↑古'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-xs min-w-[640px]">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b-2 border-pink-100">
              <th className="text-left py-2 px-2 text-gray-500">日付</th>
              <th className="text-left py-2 px-2 text-gray-500">種別</th>
              <th className="text-left py-2 px-2 text-gray-500">カテゴリ</th>
              <th className="text-right py-2 px-2 text-gray-500">金額</th>
              <th className="text-left py-2 px-2 text-gray-500">メモ</th>
              <th className="text-left py-2 px-2 text-gray-500">支払</th>
              <th className="py-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr
                key={tx.id}
                className={`border-b border-gray-50 hover:bg-pink-50/30 cursor-pointer transition-colors
                  ${tx.type === 'income' ? 'bg-mint-50/30' : ''}`}
                onClick={() => setEditTx(tx)}
              >
                <td className="py-2 px-2 text-gray-500">{tx.date}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${tx.type === 'income' ? 'bg-mint-100 text-mint-500' : 'bg-pink-100 text-pink-400'}`}>
                    {tx.type === 'income' ? '収入' : '支出'}
                  </span>
                </td>
                <td className="py-2 px-2 font-medium">{tx.category}</td>
                <td className={`py-2 px-2 text-right font-bold ${tx.type === 'income' ? 'text-mint-500' : 'text-pink-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-gray-500 max-w-[120px] truncate">{tx.memo}</td>
                <td className="py-2 px-2 text-gray-400">{tx.paymentMethod}</td>
                <td className="py-2 px-2">
                  <button
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_TRANSACTION', id: tx.id }) }}
                    className="text-gray-300 hover:text-pink-400 transition-colors"
                  >✕</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-gray-400">取引データがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {editTx && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-pink-400 mb-4">{editTx.id ? '取引を編集' : '取引を追加'}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">日付 *</label>
                  <input type="text" placeholder="yyyy/m/d" value={editTx.date || ''} onChange={e => setEditTx({ ...editTx, date: e.target.value })} className="input-cell" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">種別 *</label>
                  <select value={editTx.type || 'expense'} onChange={e => setEditTx({ ...editTx, type: e.target.value as 'income' | 'expense', category: '' })} className="input-cell">
                    <option value="expense">支出</option>
                    <option value="income">収入</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">カテゴリ *</label>
                <select value={editTx.category || ''} onChange={e => setEditTx({ ...editTx, category: e.target.value })} className="input-cell">
                  <option value="">選択してください</option>
                  {(editTx.type === 'income' ? incomeCats : expenseCats).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">金額 *</label>
                <input type="number" value={editTx.amount || ''} onChange={e => setEditTx({ ...editTx, amount: +e.target.value })} className="input-cell" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">支払方法</label>
                <select value={editTx.paymentMethod || ''} onChange={e => setEditTx({ ...editTx, paymentMethod: e.target.value })} className="input-cell">
                  <option value="">-</option>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">メモ</label>
                <input type="text" value={editTx.memo || ''} onChange={e => setEditTx({ ...editTx, memo: e.target.value })} className="input-cell" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">備考</label>
                <input type="text" value={editTx.note || ''} onChange={e => setEditTx({ ...editTx, note: e.target.value })} className="input-cell" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveTx} className="flex-1 bg-pink-300 hover:bg-pink-400 text-white py-2 rounded-xl text-sm font-bold">保存</button>
              {editTx.id && (
                <button onClick={() => { dispatch({ type: 'DELETE_TRANSACTION', id: editTx.id! }); setEditTx(null) }}
                  className="px-3 bg-red-50 hover:bg-red-100 text-red-400 rounded-xl text-sm">削除</button>
              )}
              <button onClick={() => setEditTx(null)} className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl text-sm">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
