'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { BudgetAllocation } from '@/lib/types'

const RECOMMENDED: Record<string, number> = {
  '食費': 15, '家賃': 30, '光熱費': 5, '通信費': 3,
  '交通費': 5, '日用品': 4, '娯楽': 5, '美容': 3,
}

const SURPLUS_RULES = [
  { label: '先取貯金', percent: 40, color: 'bg-mint-300', desc: '緊急時の備えと目標貯蓄' },
  { label: '投資', percent: 30, color: 'bg-sky-300', desc: 'NISA・iDeCo等の長期投資' },
  { label: '生活防衛', percent: 20, color: 'bg-lavender-300', desc: '6ヶ月分の生活費として積立' },
  { label: 'ご褒美', percent: 10, color: 'bg-peach-300', desc: '自分へのご褒美・娯楽費' },
]

export default function BudgetPage() {
  const { data, dispatch } = useStore()
  const [income, setIncome] = useState(data.budgetSetting.monthlyIncome)
  const [allocs, setAllocs] = useState<BudgetAllocation[]>(data.budgetSetting.allocations)

  useEffect(() => {
    setIncome(data.budgetSetting.monthlyIncome)
    setAllocs(data.budgetSetting.allocations)
  }, [data.budgetSetting])

  const totalPercent = allocs.reduce((s, a) => s + a.percent, 0)
  const totalAllocated = allocs.reduce((s, a) => s + income * a.percent / 100, 0)
  const surplus = income - totalAllocated
  const isOver = totalPercent > 100

  const updateAlloc = (idx: number, percent: number) => {
    const updated = allocs.map((a, i) => i === idx ? { ...a, percent } : a)
    setAllocs(updated)
  }

  const save = () => {
    dispatch({ type: 'UPDATE_BUDGET', setting: { monthlyIncome: income, allocations: allocs } })
    alert('保存しました！')
  }

  const expenseCats = data.categories.filter(c => c.type === 'expense').map(c => c.name)
  const allocCatNames = allocs.map(a => a.category)
  const missingCats = expenseCats.filter(c => !allocCatNames.includes(c))

  const addCategory = (cat: string) => {
    setAllocs([...allocs, { category: cat, percent: 0 }])
  }

  const removeAlloc = (idx: number) => {
    setAllocs(allocs.filter((_, i) => i !== idx))
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl">
      <h2 className="text-xl font-bold text-lavender-500 mb-6">💰 予算管理</h2>

      {/* Income input */}
      <div className="card border-2 border-lemon-300 mb-5">
        <h3 className="text-sm font-bold text-gray-600 mb-3">想定月収入</h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={income}
            onChange={e => setIncome(+e.target.value)}
            className="input-cell max-w-xs text-lg font-bold"
          />
          <span className="text-gray-500">円</span>
        </div>
      </div>

      {/* Allocation table */}
      <div className="card mb-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-600">カテゴリ別配分</h3>
          <div className={`text-sm font-bold px-3 py-1 rounded-full ${isOver ? 'bg-pink-100 text-pink-500' : 'bg-mint-100 text-mint-500'}`}>
            合計 {totalPercent}% {isOver && '⚠️ 100%超'}
          </div>
        </div>

        <div className="space-y-3">
          {allocs.map((alloc, idx) => {
            const amount = income * alloc.percent / 100
            const rec = RECOMMENDED[alloc.category]
            return (
              <div key={idx} className="flex flex-wrap items-center gap-2">
                <span className="w-20 text-sm font-medium text-gray-700">{alloc.category}</span>
                <input
                  type="range"
                  min={0} max={60} step={1}
                  value={alloc.percent}
                  onChange={e => updateAlloc(idx, +e.target.value)}
                  className="flex-1 min-w-24 accent-pink-400"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0} max={100}
                    value={alloc.percent}
                    onChange={e => updateAlloc(idx, +e.target.value)}
                    className="input-cell w-16 text-center"
                  />
                  <span className="text-gray-500 text-sm">%</span>
                </div>
                <span className="w-24 text-right text-sm text-gray-500">{amount.toLocaleString()}円</span>
                {rec && (
                  <span className="text-xs text-lavender-400">推奨: {rec}%</span>
                )}
                <button onClick={() => removeAlloc(idx)} className="text-pink-300 hover:text-pink-500 text-xs">✕</button>
              </div>
            )
          })}
        </div>

        {missingCats.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">追加できるカテゴリ：</p>
            <div className="flex flex-wrap gap-1">
              {missingCats.map(cat => (
                <button key={cat} onClick={() => addCategory(cat)}
                  className="text-xs px-2 py-1 bg-lavender-100 text-lavender-400 rounded-full hover:bg-lavender-200 transition-colors">
                  + {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-pink-50 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">配分済み: <span className="font-bold text-gray-700">{totalAllocated.toLocaleString()}円</span></p>
            <p className="text-xs text-gray-500">余剰: <span className={`font-bold ${surplus >= 0 ? 'text-mint-500' : 'text-pink-400'}`}>{surplus.toLocaleString()}円</span></p>
          </div>
          <button onClick={save} className="bg-pink-300 hover:bg-pink-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            保存する
          </button>
        </div>
      </div>

      {/* Surplus split */}
      <div className="card mb-5">
        <h3 className="text-sm font-bold text-gray-600 mb-4">余剰予算の振り分けルール</h3>
        <p className="text-xs text-gray-500 mb-3">余剰: <span className="font-bold text-mint-500">{Math.max(0, surplus).toLocaleString()}円</span> の使い道</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {SURPLUS_RULES.map(rule => {
            const amount = Math.round(Math.max(0, surplus) * rule.percent / 100)
            return (
              <div key={rule.label} className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${rule.color}`} />
                    <span className="text-sm font-bold text-gray-700">{rule.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">{rule.percent}%</span>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-1">{amount.toLocaleString()}円</p>
                <p className="text-xs text-gray-500">{rule.desc}</p>
              </div>
            )
          })}
        </div>
        <div className="mt-3 p-3 bg-lemon-100 rounded-xl">
          <p className="text-xs text-yellow-700">💡 <strong>黄金比家計</strong>：生活費50% / 貯蓄20% / 投資20% / 自由10% が理想バランスです</p>
        </div>
      </div>

      {/* Budget tradeoff */}
      <div className="card">
        <h3 className="text-sm font-bold text-gray-600 mb-3">予算トレードオフ</h3>
        <p className="text-xs text-gray-500 mb-3">オーバーしたカテゴリの予算を他から補填する場合のシミュレーション</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-pink-50">
                <th className="text-left p-2">カテゴリ</th>
                <th className="text-right p-2">配分額</th>
                <th className="text-right p-2">推奨%</th>
                <th className="text-right p-2">現在%</th>
                <th className="text-right p-2">差異</th>
              </tr>
            </thead>
            <tbody>
              {allocs.map((alloc, idx) => {
                const rec = RECOMMENDED[alloc.category]
                const diff = rec ? alloc.percent - rec : null
                return (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="p-2">{alloc.category}</td>
                    <td className="p-2 text-right">{(income * alloc.percent / 100).toLocaleString()}円</td>
                    <td className="p-2 text-right text-gray-400">{rec ? rec + '%' : '-'}</td>
                    <td className="p-2 text-right">{alloc.percent}%</td>
                    <td className={`p-2 text-right font-bold ${diff === null ? 'text-gray-400' : diff > 0 ? 'text-pink-400' : diff < 0 ? 'text-mint-500' : 'text-gray-500'}`}>
                      {diff === null ? '-' : diff > 0 ? `+${diff}%` : `${diff}%`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
