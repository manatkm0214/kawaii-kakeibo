'use client'
import { useStore, useMonthTransactions, useMonthSummary } from '@/lib/store'

function pct(n: number) { return n.toFixed(1) + '%' }
function fmt(n: number) { return n.toLocaleString('ja-JP') + '円' }

export default function KpiPage() {
  const { data } = useStore()
  const txs = useMonthTransactions()
  const { income, expense, balance, savingsRate } = useMonthSummary()

  const fixedCats = ['家賃', '光熱費', '通信費', '保険']
  const luxuryCats = ['娯楽', '美容']
  const fixedExpense = txs.filter(t => t.type === 'expense' && fixedCats.includes(t.category)).reduce((s, t) => s + t.amount, 0)
  const luxuryExpense = txs.filter(t => t.type === 'expense' && luxuryCats.includes(t.category)).reduce((s, t) => s + t.amount, 0)
  const totalBudget = data.budgetSetting.allocations.reduce((s, a) => s + data.budgetSetting.monthlyIncome * a.percent / 100, 0)
  const totalAssets = data.investments.reduce((s, i) => s + i.amount, 0)
  const investmentAmt = data.investments.filter(i => !['現金', '防衛資金'].includes(i.name)).reduce((s, i) => s + i.amount, 0)
  const savingsBudget = data.budgetSetting.monthlyIncome * 0.2
  const emergencyTarget = 6 * expense
  const cfIndex = fixedExpense > 0 ? balance / fixedExpense : 0

  type Status = 'excellent' | 'good' | 'normal' | 'warn' | 'danger'

  const kpis: { label: string; value: string; formula: string; status: Status; advice: string }[] = [
    {
      label: '貯蓄率',
      value: pct(savingsRate),
      formula: '(収入－支出) ÷ 収入 × 100',
      status: savingsRate >= 20 ? 'excellent' : savingsRate >= 10 ? 'good' : savingsRate >= 0 ? 'normal' : 'danger',
      advice: savingsRate >= 20 ? '理想的な貯蓄率です！' : '目標20%以上。支出を見直しましょう。',
    },
    {
      label: '節約率',
      value: pct(totalBudget > 0 ? (totalBudget - expense) / totalBudget * 100 : 0),
      formula: '(予算－実績) ÷ 予算 × 100',
      status: totalBudget > 0 && expense <= totalBudget ? 'good' : 'warn',
      advice: expense <= totalBudget ? '予算内に収まっています！' : '予算オーバー。節約を意識しましょう。',
    },
    {
      label: '浪費率',
      value: pct(expense > 0 ? luxuryExpense / expense * 100 : 0),
      formula: '(趣味＋美容) ÷ 支出 × 100',
      status: expense > 0 && luxuryExpense / expense <= 0.2 ? 'excellent' : 'warn',
      advice: expense > 0 && luxuryExpense / expense <= 0.2 ? '浪費が少ない健全な支出です！' : '趣味・美容を20%以内に抑えましょう。',
    },
    {
      label: '収支安定性',
      value: (expense > 0 ? income / expense : 0).toFixed(2),
      formula: '収入 ÷ 支出',
      status: income >= expense * 1.2 ? 'excellent' : income >= expense ? 'good' : 'danger',
      advice: income >= expense ? '収入が支出を上回っています！' : '支出が収入を超えています。要注意！',
    },
    {
      label: '予算消化率',
      value: pct(totalBudget > 0 ? expense / totalBudget * 100 : 0),
      formula: '支出 ÷ 総予算 × 100',
      status: totalBudget > 0 && expense <= totalBudget * 0.8 ? 'excellent' : expense <= totalBudget ? 'good' : 'danger',
      advice: expense <= totalBudget ? '予算内です！' : '予算オーバー！カテゴリを見直しましょう。',
    },
    {
      label: '固定費率',
      value: pct(income > 0 ? fixedExpense / income * 100 : 0),
      formula: '固定費 ÷ 収入 × 100',
      status: income > 0 && fixedExpense / income <= 0.4 ? 'excellent' : fixedExpense / income <= 0.5 ? 'good' : 'warn',
      advice: income > 0 && fixedExpense / income <= 0.5 ? '固定費が適切な範囲です！' : '固定費が高め。サブスク見直しを検討。',
    },
    {
      label: '損益分岐点',
      value: fmt(fixedExpense),
      formula: '固定費合計 = 最低必要月収',
      status: income > fixedExpense * 1.5 ? 'excellent' : income > fixedExpense ? 'good' : 'danger',
      advice: `最低${fmt(fixedExpense)}の収入が必要です。`,
    },
    {
      label: '投資比率',
      value: pct(totalAssets > 0 ? investmentAmt / totalAssets * 100 : 0),
      formula: '投資 ÷ 総資産 × 100',
      status: totalAssets > 0 && investmentAmt / totalAssets >= 0.3 ? 'excellent' : investmentAmt > 0 ? 'good' : 'normal',
      advice: investmentAmt > 0 ? '資産を投資に回せています！' : '投資を始めることを検討してみましょう。',
    },
    {
      label: '先取貯金達成度',
      value: pct(data.savingsGoal.savingsTarget > 0 ? data.savingsGoal.savingsCurrent / data.savingsGoal.savingsTarget * 100 : 0),
      formula: '先取貯金実績 ÷ 目標額 × 100',
      status: data.savingsGoal.savingsCurrent >= data.savingsGoal.savingsTarget ? 'excellent' : data.savingsGoal.savingsCurrent >= data.savingsGoal.savingsTarget * 0.7 ? 'good' : 'normal',
      advice: data.savingsGoal.savingsCurrent >= data.savingsGoal.savingsTarget ? '目標達成！次の目標を設定しましょう！' : `残り${fmt(data.savingsGoal.savingsTarget - data.savingsGoal.savingsCurrent)}で目標達成です！`,
    },
    {
      label: '防衛資金達成度',
      value: pct(emergencyTarget > 0 ? data.savingsGoal.emergencyCurrent / emergencyTarget * 100 : 0),
      formula: '現在の防衛資金 ÷ (6ヶ月分支出) × 100',
      status: data.savingsGoal.emergencyCurrent >= emergencyTarget ? 'excellent' : data.savingsGoal.emergencyCurrent >= emergencyTarget * 0.5 ? 'good' : 'warn',
      advice: data.savingsGoal.emergencyCurrent >= emergencyTarget ? '6ヶ月分の防衛資金が揃っています！' : `目標: ${fmt(emergencyTarget)}。少しずつ積み立てましょう。`,
    },
    {
      label: 'CF指数',
      value: cfIndex.toFixed(2),
      formula: '収支 ÷ 固定費',
      status: cfIndex >= 2 ? 'excellent' : cfIndex >= 1 ? 'good' : cfIndex >= 0 ? 'warn' : 'danger',
      advice: cfIndex >= 1 ? '固定費に対して十分な余裕があります！' : '固定費に対する余裕が少ない状態です。',
    },
    {
      label: '生活費比率',
      value: pct(income > 0 ? expense / income * 100 : 0),
      formula: '支出 ÷ 収入 × 100',
      status: income > 0 && expense / income <= 0.7 ? 'excellent' : expense / income <= 0.85 ? 'good' : 'warn',
      advice: income > 0 && expense / income <= 0.7 ? '収入の70%以内で生活できています！' : '支出が収入の大部分を占めています。',
    },
  ]

  const statusStyle: Record<string, string> = {
    excellent: 'bg-mint-50 border-mint-200',
    good: 'bg-sky-50 border-sky-200',
    normal: 'bg-lemon-100 border-lemon-300',
    warn: 'bg-peach-50 border-peach-200',
    danger: 'bg-pink-50 border-pink-200',
  }

  const statusBadge: Record<string, string> = {
    excellent: 'bg-mint-300 text-white',
    good: 'bg-sky-300 text-white',
    normal: 'bg-lemon-400 text-gray-700',
    warn: 'bg-peach-300 text-white',
    danger: 'bg-pink-300 text-white',
  }

  const statusText: Record<string, string> = {
    excellent: '優秀', good: '良好', normal: '標準', warn: '要改善', danger: '危険',
  }

  const totalScore = Math.round(kpis.reduce((s, k) => {
    const scores = { excellent: 8, good: 6, normal: 4, warn: 2, danger: 0 }
    return s + scores[k.status]
  }, 0) / kpis.length * 100 / 8)

  return (
    <div className="p-4 lg:p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-lavender-500">📊 KPI分析</h2>
        <div className="card border-2 border-lavender-200 px-4 py-2 text-center">
          <p className="text-xs text-gray-500">総合スコア</p>
          <p className="text-2xl font-bold text-lavender-400">{totalScore}<span className="text-sm text-gray-400">/100</span></p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className={`rounded-2xl border-2 p-4 ${statusStyle[kpi.status]}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-gray-700">{kpi.label}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusBadge[kpi.status]}`}>
                {statusText[kpi.status]}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1">{kpi.value}</p>
            <p className="text-[10px] text-gray-400 mb-2 font-mono">{kpi.formula}</p>
            <p className="text-xs text-gray-600">{kpi.advice}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
