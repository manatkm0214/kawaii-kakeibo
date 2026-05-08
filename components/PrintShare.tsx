'use client'
import { useState } from 'react'
import { useStore, useMonthTransactions, useMonthSummary } from '@/lib/store'

export default function PrintShare() {
  const { data } = useStore()
  const txs = useMonthTransactions()
  const { income, expense, balance, savingsRate } = useMonthSummary()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const { selectedYear: year, selectedMonth: month } = data

  const fixedCats = ['家賃', '光熱費', '通信費', '保険']
  const luxuryCats = ['娯楽', '美容']
  const fixedExpense = txs.filter(t => t.type === 'expense' && fixedCats.includes(t.category)).reduce((s, t) => s + t.amount, 0)
  const luxuryExpense = txs.filter(t => t.type === 'expense' && luxuryCats.includes(t.category)).reduce((s, t) => s + t.amount, 0)

  const catMap: Record<string, number> = {}
  txs.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount })
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const totalBudget = data.budgetSetting.allocations.reduce((s, a) => s + data.budgetSetting.monthlyIncome * a.percent / 100, 0)
  const budgetRate = totalBudget > 0 ? expense / totalBudget * 100 : 0

  const generateSummaryText = () => {
    const lines = [
      `☆ かわいい家計簿 ${year}年${month}月レポート ☆`,
      `━━━━━━━━━━━━━━━━━━`,
      `📥 収入合計    ¥${income.toLocaleString()}`,
      `📤 支出合計    ¥${expense.toLocaleString()}`,
      `💰 収支        ${balance >= 0 ? '+' : ''}¥${balance.toLocaleString()}`,
      `🐷 貯蓄率      ${savingsRate.toFixed(1)}%${savingsRate >= 20 ? ' ✓' : ' △'}`,
      ``,
      `📊 支出カテゴリ TOP5`,
      ...topCats.map((c, i) => `  ${i + 1}. ${c[0]}: ¥${c[1].toLocaleString()}`),
      ``,
      `📋 KPI チェック`,
      `  固定費率: ${income > 0 ? (fixedExpense / income * 100).toFixed(1) : 0}%${income > 0 && fixedExpense / income <= 0.5 ? ' ✓' : ' △'}`,
      `  浪費率: ${expense > 0 ? (luxuryExpense / expense * 100).toFixed(1) : 0}%${expense > 0 && luxuryExpense / expense <= 0.2 ? ' ✓' : ' △'}`,
      `  予算消化率: ${budgetRate.toFixed(1)}%${budgetRate <= 100 ? ' ✓' : ' ⚠'}`,
      `━━━━━━━━━━━━━━━━━━`,
      `毎日のお金管理を楽しく♪`,
    ]
    return lines.join('\n')
  }

  const handleCopy = async () => {
    const text = generateSummaryText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleShare = async () => {
    const text = generateSummaryText()
    if (navigator.share) {
      try {
        await navigator.share({ title: `家計簿 ${year}年${month}月`, text })
      } catch { /* cancelled */ }
    } else {
      await handleCopy()
    }
  }

  const handlePrint = () => {
    setOpen(false)
    setTimeout(() => window.print(), 100)
  }

  const summaryText = generateSummaryText()

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="no-print fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-pink-300 hover:bg-pink-400 text-white shadow-lg flex items-center justify-center text-xl transition-all hover:scale-110"
        title="印刷・共有"
      >
        📤
      </button>

      {/* Modal */}
      {open && (
        <div className="no-print fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-pink-400">📤 印刷・共有</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs font-mono text-gray-600 whitespace-pre max-h-48 overflow-y-auto leading-relaxed">
              {summaryText}
            </div>

            <div className="space-y-2">
              {/* Copy text */}
              <button
                onClick={handleCopy}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2
                  ${copied ? 'bg-mint-200 text-mint-700' : 'bg-lemon-200 hover:bg-lemon-300 text-yellow-800'}`}
              >
                {copied ? '✓ コピーしました！' : '📋 テキストをコピー（LINE・メール用）'}
              </button>

              {/* Share (mobile) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleShare}
                  className="w-full py-3 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-xl text-sm font-bold transition-colors"
                >
                  🔗 アプリで共有（LINE・メール等）
                </button>
              )}

              {/* Print */}
              <button
                onClick={handlePrint}
                className="w-full py-3 bg-lavender-100 hover:bg-lavender-200 text-lavender-600 rounded-xl text-sm font-bold transition-colors"
              >
                🖨️ このページを印刷する
              </button>

              {/* Export JSON */}
              <button
                onClick={() => {
                  const d = JSON.stringify(data, null, 2)
                  const blob = new Blob([d], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `kawaii-kakeibo-${year}-${month}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  setOpen(false)
                }}
                className="w-full py-3 bg-pink-50 hover:bg-pink-100 text-pink-500 rounded-xl text-sm font-bold transition-colors"
              >
                💾 全データをバックアップ（JSON）
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
