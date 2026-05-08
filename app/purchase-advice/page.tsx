'use client'
import { useState } from 'react'
import { useStore, useMonthSummary } from '@/lib/store'
import AmountInput from '@/components/AmountInput'

interface CheckResult {
  label: string
  ok: boolean
  detail: string
}

export default function PurchaseAdvicePage() {
  const { data } = useStore()
  const { income, expense, balance } = useMonthSummary()
  const [itemName, setItemName] = useState('')
  const [itemAmount, setItemAmount] = useState<number>(0)
  const [itemCategory, setItemCategory] = useState('')
  const [necessity, setNecessity] = useState(3)
  const [checked, setChecked] = useState(false)

  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const dayProgress = today.getDate() / daysInMonth
  const expenseProgress = income > 0 ? expense / income : 0

  const totalBudget = data.budgetSetting.allocations.reduce((s, a) => s + data.budgetSetting.monthlyIncome * a.percent / 100, 0)
  const catBudget = data.budgetSetting.allocations.find(a => a.category === itemCategory)
  const catBudgetAmt = catBudget ? data.budgetSetting.monthlyIncome * catBudget.percent / 100 : 0
  const catSpent = data.transactions.filter(t => {
    const [y, m] = t.date.split('/').map(Number)
    return t.type === 'expense' && t.category === itemCategory && y === today.getFullYear() && m === (today.getMonth() + 1)
  }).reduce((s, t) => s + t.amount, 0)
  const catRemaining = catBudgetAmt - catSpent

  const amount = Number(itemAmount) || 0
  const remainingBudget = totalBudget - expense
  const emergencyFund = data.savingsGoal.emergencyCurrent
  const savingsAfter = balance - amount

  const checks: CheckResult[] = [
    {
      label: '① 予算チェック',
      ok: remainingBudget >= amount,
      detail: remainingBudget >= amount
        ? `今月の予算残り: ${remainingBudget.toLocaleString()}円 ✓`
        : `予算残り: ${remainingBudget.toLocaleString()}円 (${(amount - remainingBudget).toLocaleString()}円不足)`,
    },
    {
      label: '② 収入比',
      ok: income > 0 && amount / income <= 0.05,
      detail: income > 0
        ? `収入の${(amount / income * 100).toFixed(1)}% ${amount / income <= 0.05 ? '(5%以内 ✓)' : '(5%超 ⚠)'}`
        : '収入データが不足',
    },
    {
      label: '③ 貯蓄目標',
      ok: savingsAfter >= 0,
      detail: savingsAfter >= 0
        ? `購入後の収支: +${savingsAfter.toLocaleString()}円 ✓`
        : `購入後の収支: ${savingsAfter.toLocaleString()}円 (マイナスに)`,
    },
    {
      label: '④ カテゴリ予算',
      ok: !catBudgetAmt || catRemaining >= amount,
      detail: catBudgetAmt
        ? catRemaining >= amount
          ? `${itemCategory}予算の残り: ${catRemaining.toLocaleString()}円 ✓`
          : `${itemCategory}予算の残り: ${catRemaining.toLocaleString()}円 (不足)`
        : 'カテゴリ予算の設定なし',
    },
    {
      label: '⑤ 防衛資金',
      ok: emergencyFund >= expense * 3,
      detail: emergencyFund >= expense * 6
        ? `防衛資金 ${(emergencyFund / 10000).toFixed(0)}万円 (十分 ✓)`
        : `防衛資金 ${(emergencyFund / 10000).toFixed(0)}万円 (6ヶ月分を目標に積立中)`,
    },
    {
      label: '⑥ 必要度',
      ok: necessity >= 4,
      detail: necessity >= 5 ? '★★★★★ 絶対必要 ✓' : necessity >= 4 ? '★★★★☆ かなり必要 ✓' : necessity >= 3 ? '★★★☆☆ まあまあ必要' : necessity >= 2 ? '★★☆☆☆ あまり不要' : '★☆☆☆☆ 不要',
    },
    {
      label: '⑦ 消費ペース',
      ok: expenseProgress <= dayProgress * 1.1,
      detail: expenseProgress <= dayProgress
        ? `支出ペース良好 (${(expenseProgress * 100).toFixed(0)}% / 月${(dayProgress * 100).toFixed(0)}%経過 ✓)`
        : `支出が月進捗より多め (${(expenseProgress * 100).toFixed(0)}% vs ${(dayProgress * 100).toFixed(0)}%)`,
    },
  ]

  const okCount = checks.filter(c => c.ok).length
  const judgment = okCount >= 6 ? { label: '✅ 買って大丈夫！', color: 'bg-mint-100 text-mint-600 border-mint-300', advice: '財務的に問題ありません。安心して購入を！' }
    : okCount >= 5 ? { label: '🤔 慎重に検討を', color: 'bg-lemon-100 text-yellow-700 border-lemon-300', advice: '大部分はOKですが、1〜2項目が気になります。本当に必要か再確認を。' }
    : okCount >= 3 ? { label: '⚠️ もう少し待って', color: 'bg-peach-100 text-peach-600 border-peach-200', advice: '半分以上の項目に懸念があります。来月以降に先送りするか、より安い代替案を探しましょう。' }
    : { label: '🚫 今は見送って', color: 'bg-pink-100 text-pink-600 border-pink-200', advice: '今月は財務的に余裕がありません。購入は見送ることをお勧めします。' }

  const expenseCats = data.categories.filter(c => c.type === 'expense').map(c => c.name)

  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <h2 className="text-xl font-bold text-peach-400 mb-6">🛍️ 購入アドバイス</h2>
      <p className="text-xs text-gray-500 mb-5">買い物前の冷静判断アシスタント。7項目で「買って大丈夫？」を診断します。</p>

      {/* Input */}
      <div className="card mb-5">
        <h3 className="text-sm font-bold text-gray-600 mb-4">購入したいものを入力</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">品名</label>
            <input type="text" placeholder="例: 新しいバッグ" value={itemName} onChange={e => setItemName(e.target.value)} className="input-cell" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">金額</label>
            <AmountInput value={itemAmount} onChange={v => setItemAmount(v)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">カテゴリ</label>
            <select title="カテゴリ" value={itemCategory} onChange={e => setItemCategory(e.target.value)} className="input-cell">
              <option value="">選択してください</option>
              {expenseCats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">必要度 ★{necessity}</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setNecessity(n)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${n <= necessity ? 'bg-peach-300 text-white' : 'bg-gray-100 text-gray-400 hover:bg-peach-100'}`}>
                  ★
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">1=不要 / 3=普通 / 5=絶対必要</p>
          </div>
        </div>
        <button
          onClick={() => setChecked(true)}
          disabled={!itemName || itemAmount <= 0 || !itemCategory}
          className="mt-4 w-full bg-peach-300 hover:bg-peach-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-2 rounded-xl font-bold text-sm transition-colors"
        >
          診断する
        </button>
      </div>

      {/* Results */}
      {checked && amount > 0 && (
        <>
          {/* Judgment */}
          <div className={`card border-2 mb-4 text-center py-4 ${judgment.color}`}>
            <p className="text-2xl font-bold mb-2">{judgment.label}</p>
            <p className="text-sm">{okCount}/7項目 OK</p>
            <p className="text-xs mt-2 opacity-80">{judgment.advice}</p>
          </div>

          {/* Checklist */}
          <div className="card">
            <h3 className="text-sm font-bold text-gray-600 mb-3">診断結果詳細</h3>
            <div className="space-y-2">
              {checks.map((check, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl ${check.ok ? 'bg-mint-50' : 'bg-pink-50'}`}>
                  <span className="text-lg flex-shrink-0">{check.ok ? '✅' : '❌'}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-700">{check.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-cream rounded-2xl border border-lemon-200">
            <p className="text-xs text-yellow-800">
              💡 <strong>{itemName}</strong>（{amount.toLocaleString()}円）の診断結果: <strong>{okCount}/7</strong>項目クリア
              {okCount < 5 && '。購入を見送って、来月また検討してみてください。'}
              {okCount >= 5 && '。購入の準備ができています！'}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
