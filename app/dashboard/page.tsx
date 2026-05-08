'use client'
import { useStore, useMonthTransactions, useMonthSummary } from '@/lib/store'

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function fmt(n: number) {
  return n.toLocaleString('ja-JP') + '円'
}

function pct(n: number) {
  return n.toFixed(1) + '%'
}

export default function DashboardPage() {
  const { data, dispatch } = useStore()
  const txs = useMonthTransactions()
  const { income, expense, balance, savingsRate } = useMonthSummary()

  const fixedCats = ['家賃', '光熱費', '通信費', '保険']
  const luxuryCats = ['娯楽', '美容']

  const fixedExpense = txs.filter(t => t.type === 'expense' && fixedCats.includes(t.category)).reduce((s, t) => s + t.amount, 0)
  const luxuryExpense = txs.filter(t => t.type === 'expense' && luxuryCats.includes(t.category)).reduce((s, t) => s + t.amount, 0)
  const totalBudget = data.budgetSetting.allocations.reduce((s, a) => s + (data.budgetSetting.monthlyIncome * a.percent / 100), 0)
  const totalAssets = data.investments.reduce((s, inv) => s + inv.amount, 0)
  const investmentAmount = data.investments.filter(i => !['現金', '防衛資金'].includes(i.name)).reduce((s, i) => s + i.amount, 0)

  const kpis = [
    { label: '貯蓄率', value: pct(savingsRate), status: savingsRate >= 20 ? 'excellent' : savingsRate >= 10 ? 'good' : savingsRate >= 0 ? 'normal' : 'danger', hint: '目標: 20%以上' },
    { label: '浪費率', value: pct(expense > 0 ? luxuryExpense / expense * 100 : 0), status: expense > 0 && luxuryExpense / expense <= 0.2 ? 'excellent' : 'warn', hint: '目標: 20%以内' },
    { label: '固定費率', value: pct(income > 0 ? fixedExpense / income * 100 : 0), status: income > 0 && fixedExpense / income <= 0.5 ? 'good' : 'warn', hint: '目標: 50%以下' },
    { label: '予算消化率', value: pct(totalBudget > 0 ? expense / totalBudget * 100 : 0), status: totalBudget > 0 && expense <= totalBudget ? 'good' : 'danger', hint: '100%以内が理想' },
    { label: 'CF指数', value: (fixedExpense > 0 ? balance / fixedExpense : 0).toFixed(2), status: fixedExpense > 0 && balance / fixedExpense >= 1 ? 'excellent' : 'warn', hint: '1以上で余裕' },
    { label: '収支安定性', value: (expense > 0 ? income / expense : 0).toFixed(2), status: expense > 0 && income / expense >= 1 ? 'good' : 'danger', hint: '1.0以上が安全' },
    { label: '投資比率', value: pct(totalAssets > 0 ? investmentAmount / totalAssets * 100 : 0), status: investmentAmount > 0 ? 'good' : 'normal', hint: '資産の30〜50%が目安' },
    { label: '先取貯金', value: pct(data.savingsGoal.savingsTarget > 0 ? data.savingsGoal.savingsCurrent / data.savingsGoal.savingsTarget * 100 : 0), status: data.savingsGoal.savingsCurrent >= data.savingsGoal.savingsTarget ? 'excellent' : 'normal', hint: '目標達成度' },
  ]

  const statusColors: Record<string, string> = {
    excellent: 'bg-mint-100 text-mint-500 border-mint-200',
    good: 'bg-sky-100 text-sky-500 border-sky-200',
    normal: 'bg-lemon-100 text-yellow-600 border-lemon-300',
    warn: 'bg-peach-100 text-peach-400 border-peach-200',
    danger: 'bg-pink-100 text-pink-400 border-pink-200',
  }

  const statusLabel: Record<string, string> = {
    excellent: '優秀', good: '良好', normal: '標準', warn: '要改善', danger: '危険',
  }

  const expenseCats = data.categories.filter(c => c.type === 'expense')
  const budgetRows = expenseCats.slice(0, 8).map(cat => {
    const actual = txs.filter(t => t.type === 'expense' && t.category === cat.name).reduce((s, t) => s + t.amount, 0)
    const budget = cat.budgetAmount
    const remaining = budget - actual
    const rate = budget > 0 ? actual / budget * 100 : 0
    return { category: cat.name, budget, actual, remaining, rate }
  })

  const safetyScore = Math.min(100, Math.round(
    (savingsRate >= 20 ? 20 : savingsRate >= 10 ? 10 : 0) +
    (income > 0 && fixedExpense / income <= 0.5 ? 15 : 0) +
    (totalBudget > 0 && expense <= totalBudget ? 15 : 0) +
    (fixedExpense > 0 && balance / fixedExpense >= 1 ? 15 : 0) +
    (income > expense ? 10 : 0) +
    (investmentAmount > 0 ? 10 : 0) +
    (data.savingsGoal.emergencyCurrent >= data.savingsGoal.emergencyMonths * (expense || 1) ? 15 : 7)
  ))

  const lifeLevel = safetyScore >= 90 ? { label: '🌟 余裕クリエイター', color: 'text-pink-400' }
    : safetyScore >= 70 ? { label: '😊 安定生活者', color: 'text-mint-500' }
    : safetyScore >= 50 ? { label: '😐 普通家計', color: 'text-sky-400' }
    : safetyScore >= 30 ? { label: '😟 要改善', color: 'text-peach-400' }
    : { label: '😰 危機状態', color: 'text-pink-500' }

  return (
    <div className="p-4 lg:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-pink-400">🏠 ダッシュボード</h2>
        <div className="flex items-center gap-2">
          <select
            title="年を選択"
            value={data.selectedYear}
            onChange={e => dispatch({ type: 'SET_MONTH', year: +e.target.value, month: data.selectedMonth })}
            className="input-cell w-24"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}年</option>)}
          </select>
          <select
            title="月を選択"
            value={data.selectedMonth}
            onChange={e => dispatch({ type: 'SET_MONTH', year: data.selectedYear, month: +e.target.value })}
            className="input-cell w-20"
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}月</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: '収入', value: fmt(income), color: 'border-mint-200 bg-mint-50', textColor: 'text-mint-500' },
          { label: '支出', value: fmt(expense), color: 'border-pink-200 bg-pink-50', textColor: 'text-pink-400' },
          { label: '収支', value: fmt(balance), color: balance >= 0 ? 'border-sky-200 bg-sky-50' : 'border-peach-200 bg-peach-50', textColor: balance >= 0 ? 'text-sky-500' : 'text-peach-400' },
          { label: '貯蓄率', value: pct(savingsRate), color: savingsRate >= 20 ? 'border-mint-200 bg-mint-50' : 'border-lemon-300 bg-lemon-100', textColor: savingsRate >= 20 ? 'text-mint-500' : 'text-yellow-600' },
        ].map(card => (
          <div key={card.label} className={`card border-2 ${card.color}`}>
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-lg font-bold ${card.textColor}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* KPI mini cards */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-600 mb-3">📊 KPIミニカード</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {kpis.map(kpi => (
            <div key={kpi.label} className={`rounded-xl p-3 border ${statusColors[kpi.status]}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium">{kpi.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/60 font-bold">{statusLabel[kpi.status]}</span>
              </div>
              <p className="text-lg font-bold">{kpi.value}</p>
              <p className="text-[10px] opacity-70 mt-0.5">{kpi.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Budget check table */}
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-bold text-gray-600 mb-3">💰 予算チェック</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-pink-100">
                  <th className="text-left py-2 text-gray-500">カテゴリ</th>
                  <th className="text-right py-2 text-gray-500">予算</th>
                  <th className="text-right py-2 text-gray-500">実績</th>
                  <th className="text-right py-2 text-gray-500">残り</th>
                  <th className="text-right py-2 text-gray-500">達成率</th>
                </tr>
              </thead>
              <tbody>
                {budgetRows.map(row => (
                  <tr key={row.category} className="border-b border-gray-50 hover:bg-pink-50/30">
                    <td className="py-2 font-medium">{row.category}</td>
                    <td className="py-2 text-right text-gray-500">{row.budget.toLocaleString()}</td>
                    <td className={`py-2 text-right font-medium ${row.rate > 100 ? 'text-pink-400' : 'text-gray-700'}`}>
                      {row.actual.toLocaleString()}
                    </td>
                    <td className={`py-2 text-right ${row.remaining < 0 ? 'text-pink-400' : 'text-mint-500'}`}>
                      {row.remaining.toLocaleString()}
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-16 progress-bar">
                          <div
                            className={`progress-fill ${row.rate > 100 ? 'bg-pink-300' : row.rate > 80 ? 'bg-lemon-400' : 'bg-mint-300'}`}
                            style={{ width: `${Math.min(100, row.rate)}%` }}
                          />
                        </div>
                        <span className={`w-8 text-right ${row.rate > 100 ? 'text-pink-400' : 'text-gray-600'}`}>
                          {row.rate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Safety score & Life level */}
        <div className="flex flex-col gap-3">
          <div className="card border-2 border-pink-100 text-center">
            <h3 className="text-xs font-bold text-gray-500 mb-2">🛡️ 安全度スコア</h3>
            <div className="relative w-24 h-24 mx-auto mb-2">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" strokeWidth="12" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={safetyScore >= 70 ? '#A8E6CF' : safetyScore >= 40 ? '#FFE566' : '#FF9BB5'}
                  strokeWidth="12"
                  strokeDasharray={`${safetyScore * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-gray-700">{safetyScore}</span>
                <span className="text-[10px] text-gray-400">/ 100</span>
              </div>
            </div>
            <p className={`text-sm font-bold ${lifeLevel.color}`}>{lifeLevel.label}</p>
          </div>

          <div className="card border-2 border-lavender-100">
            <h3 className="text-xs font-bold text-gray-500 mb-3">📋 生活レベル評価</h3>
            {[
              { range: '90-100', label: '🌟 余裕クリエイター', active: safetyScore >= 90 },
              { range: '70-89', label: '😊 安定生活者', active: safetyScore >= 70 && safetyScore < 90 },
              { range: '50-69', label: '😐 普通家計', active: safetyScore >= 50 && safetyScore < 70 },
              { range: '30-49', label: '😟 要改善', active: safetyScore >= 30 && safetyScore < 50 },
              { range: '0-29', label: '😰 危機状態', active: safetyScore < 30 },
            ].map(level => (
              <div
                key={level.range}
                className={`flex justify-between items-center px-2 py-1 rounded-lg text-xs mb-1 transition-colors
                  ${level.active ? 'bg-pink-100 font-bold text-pink-500' : 'text-gray-400'}`}
              >
                <span>{level.label}</span>
                <span className="text-[10px]">{level.range}点</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
