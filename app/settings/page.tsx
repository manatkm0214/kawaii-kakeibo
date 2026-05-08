'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Category } from '@/lib/types'

export default function SettingsPage() {
  const { data, dispatch } = useStore()
  const [categories, setCategories] = useState<Category[]>(data.categories)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense')
  const [saved, setSaved] = useState(false)

  const incomeCats = categories.filter(c => c.type === 'income')
  const expenseCats = categories.filter(c => c.type === 'expense')

  const updateBudget = (name: string, amount: number) => {
    setCategories(categories.map(c => c.name === name ? { ...c, budgetAmount: amount } : c))
  }

  const removeCategory = (name: string) => {
    setCategories(categories.filter(c => c.name !== name))
  }

  const addCategory = () => {
    if (!newCatName.trim() || categories.find(c => c.name === newCatName.trim())) return
    setCategories([...categories, { name: newCatName.trim(), type: newCatType, budgetAmount: 0 }])
    setNewCatName('')
  }

  const saveCategories = () => {
    dispatch({ type: 'UPDATE_CATEGORIES', categories })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetData = () => {
    if (confirm('全データをリセットしますか？この操作は取り消せません。')) {
      localStorage.removeItem('kawaii-kakeibo')
      window.location.reload()
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <h2 className="text-xl font-bold text-sky-500 mb-6">⚙️ 設定</h2>

      {/* Categories */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-600">カテゴリマスタ</h3>
          <span className="text-xs text-gray-400">収入 {incomeCats.length}件 / 支出 {expenseCats.length}件</span>
        </div>

        {/* Income categories */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-mint-500 mb-2">収入カテゴリ</h4>
          <div className="space-y-2">
            {incomeCats.map(cat => (
              <div key={cat.name} className="flex items-center gap-2 p-2 bg-mint-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700 w-24">{cat.name}</span>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-xs text-gray-500">予算目安</span>
                  <input
                    type="number"
                    value={cat.budgetAmount}
                    onChange={e => updateBudget(cat.name, +e.target.value)}
                    className="input-cell flex-1 text-right"
                  />
                  <span className="text-xs text-gray-500">円</span>
                </div>
                <button onClick={() => removeCategory(cat.name)} className="text-gray-300 hover:text-pink-400 transition-colors">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Expense categories */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-pink-400 mb-2">支出カテゴリ</h4>
          <div className="space-y-2">
            {expenseCats.map(cat => (
              <div key={cat.name} className="flex items-center gap-2 p-2 bg-pink-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700 w-24">{cat.name}</span>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-xs text-gray-500">予算</span>
                  <input
                    type="number"
                    value={cat.budgetAmount}
                    onChange={e => updateBudget(cat.name, +e.target.value)}
                    className="input-cell flex-1 text-right"
                  />
                  <span className="text-xs text-gray-500">円</span>
                </div>
                <button onClick={() => removeCategory(cat.name)} className="text-gray-300 hover:text-pink-400 transition-colors">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Add category */}
        <div className="border-t border-gray-100 pt-3">
          <h4 className="text-xs font-bold text-gray-500 mb-2">カテゴリを追加</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="カテゴリ名"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              className="input-cell flex-1"
            />
            <select value={newCatType} onChange={e => setNewCatType(e.target.value as 'income' | 'expense')} className="input-cell w-20">
              <option value="expense">支出</option>
              <option value="income">収入</option>
            </select>
            <button onClick={addCategory} className="px-3 py-1 bg-sky-200 hover:bg-sky-300 text-sky-700 rounded-xl text-sm font-bold transition-colors">追加</button>
          </div>
        </div>

        <button onClick={saveCategories}
          className={`mt-4 w-full py-2 rounded-xl font-bold text-sm transition-colors ${saved ? 'bg-mint-300 text-white' : 'bg-sky-300 hover:bg-sky-400 text-white'}`}>
          {saved ? '✓ 保存しました！' : 'カテゴリを保存'}
        </button>
      </div>

      {/* Budget targets */}
      <div className="card mb-5">
        <h3 className="text-sm font-bold text-gray-600 mb-3">予算目安（参考）</h3>
        <p className="text-xs text-gray-400 mb-3">各カテゴリの月間予算目安額。ダッシュボードの予算チェックに使用されます。</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500">カテゴリ</th>
                <th className="text-center py-2 text-gray-500">種別</th>
                <th className="text-right py-2 text-gray-500">月間予算</th>
                <th className="text-right py-2 text-gray-500">年間予算</th>
              </tr>
            </thead>
            <tbody>
              {categories.filter(c => c.budgetAmount > 0).map(cat => (
                <tr key={cat.name} className="border-b border-gray-50">
                  <td className="py-2">{cat.name}</td>
                  <td className="py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full ${cat.type === 'income' ? 'bg-mint-100 text-mint-500' : 'bg-pink-100 text-pink-400'}`}>
                      {cat.type === 'income' ? '収入' : '支出'}
                    </span>
                  </td>
                  <td className="py-2 text-right font-medium">{cat.budgetAmount.toLocaleString()}円</td>
                  <td className="py-2 text-right text-gray-400">{(cat.budgetAmount * 12).toLocaleString()}円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data management */}
      <div className="card border-2 border-pink-100">
        <h3 className="text-sm font-bold text-gray-600 mb-3">データ管理</h3>
        <div className="space-y-3">
          <div className="p-3 bg-sky-50 rounded-xl">
            <p className="text-xs text-sky-700">💾 データはブラウザのローカルストレージに保存されています。</p>
            <p className="text-xs text-sky-600 mt-1">ブラウザのデータを削除するとリセットされます。</p>
          </div>
          <button
            onClick={() => {
              const d = JSON.stringify(data, null, 2)
              const blob = new Blob([d], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `kawaii-kakeibo-${new Date().toISOString().split('T')[0]}.json`
              a.click()
            }}
            className="w-full py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-xl text-sm font-bold transition-colors"
          >
            📥 データをエクスポート (JSON)
          </button>
          <button onClick={resetData} className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-500 rounded-xl text-sm font-bold transition-colors border border-pink-200">
            🔄 全データをリセット
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card mt-5 text-center bg-gradient-to-br from-pink-50 to-lavender-50 border border-pink-100">
        <p className="text-2xl mb-2">☆</p>
        <h3 className="text-base font-bold text-pink-400">かわいい家計簿 プロ版</h3>
        <p className="text-xs text-gray-500 mt-1">12種類の機能 / 12個のKPI指標</p>
        <p className="text-xs text-gray-400 mt-2">毎日のお金管理を楽しく、かわいく♪</p>
      </div>
    </div>
  )
}
