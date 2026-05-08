'use client'
import { useStore } from '@/lib/store'
import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#FF9BB5', '#A8E6CF', '#C8B8E8', '#87CEEB', '#FFF3B0', '#FFAA80', '#B8EED5', '#D8CCF0', '#BAE3FF', '#FFDABD']

export default function ReportsPage() {
  const { data } = useStore()
  const { selectedYear: year, selectedMonth: month } = data

  const monthTxs = useMemo(() => data.transactions.filter(t => {
    const [y, m] = t.date.split('/').map(Number)
    return y === year && m === month
  }), [data.transactions, year, month])

  const expenseTxs = monthTxs.filter(t => t.type === 'expense')
  const totalExpense = expenseTxs.reduce((s, t) => s + t.amount, 0)

  const catRanking = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {}
    expenseTxs.forEach(t => {
      if (!map[t.category]) map[t.category] = { amount: 0, count: 0 }
      map[t.category].amount += t.amount
      map[t.category].count += 1
    })
    return Object.entries(map)
      .map(([cat, d]) => ({ cat, ...d, ratio: totalExpense > 0 ? d.amount / totalExpense * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
  }, [expenseTxs, totalExpense])

  const pieData = catRanking.map(c => ({ name: c.cat, value: c.amount }))

  const sixMonthData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      let m = month - 5 + i
      let y = year
      while (m <= 0) { m += 12; y -= 1 }
      const txs = data.transactions.filter(t => {
        const [ty, tm] = t.date.split('/').map(Number)
        return ty === y && tm === m
      })
      const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const savRate = inc > 0 ? Math.round((inc - exp) / inc * 100) : 0
      return { month: `${y}/${m}月`, income: inc, expense: exp, balance: inc - exp, savingsRate: savRate }
    })
  }, [data.transactions, year, month])

  return (
    <div className="p-4 lg:p-6 max-w-5xl">
      <h2 className="text-xl font-bold text-lavender-500 mb-6">📑 月次レポート</h2>

      {/* Current month summary */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: '支出合計', value: totalExpense.toLocaleString() + '円', color: 'text-pink-400' },
          { label: 'カテゴリ数', value: catRanking.length + '種', color: 'text-lavender-400' },
          { label: '取引件数', value: monthTxs.length + '件', color: 'text-sky-400' },
        ].map(item => (
          <div key={item.label} className="card text-center py-2">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Category ranking */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-600 mb-3">カテゴリ別支出ランキング</h3>
          <div className="space-y-2">
            {catRanking.map((cat, idx) => (
              <div key={cat.cat}>
                <div className="flex justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: COLORS[idx % COLORS.length] }}>
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-700">{cat.cat}</span>
                    <span className="text-gray-400">{cat.count}件</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">{cat.amount.toLocaleString()}円</span>
                    <span className="text-gray-400 w-10 text-right">{cat.ratio.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${cat.ratio}%`, background: COLORS[idx % COLORS.length] }} />
                </div>
              </div>
            ))}
            {catRanking.length === 0 && <p className="text-center text-gray-400 py-4">支出データがありません</p>}
          </div>
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-600 mb-3">カテゴリ別支出割合</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                  dataKey="value" paddingAngle={2}>
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [Number(v).toLocaleString() + '円', '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">データなし</div>
          )}
        </div>
      </div>

      {/* 6-month trend */}
      <div className="card mb-4">
        <h3 className="text-sm font-bold text-gray-600 mb-3">6ヶ月推移（収入 / 支出 / 貯蓄率）</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={sixMonthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} />
            <Tooltip formatter={(v, name) => [Number(v).toLocaleString() + (name === '貯蓄率' ? '%' : '円'), String(name)]} />
            <Legend />
            <Bar dataKey="income" name="収入" fill="#A8E6CF" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="支出" fill="#FF9BB5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 6-month table */}
      <div className="card overflow-x-auto">
        <h3 className="text-sm font-bold text-gray-600 mb-3">月別サマリー</h3>
        <table className="w-full text-xs min-w-[480px]">
          <thead>
            <tr className="border-b-2 border-pink-100">
              <th className="text-left py-2 text-gray-500">月</th>
              <th className="text-right py-2 text-gray-500">収入</th>
              <th className="text-right py-2 text-gray-500">支出</th>
              <th className="text-right py-2 text-gray-500">収支</th>
              <th className="text-right py-2 text-gray-500">貯蓄率</th>
            </tr>
          </thead>
          <tbody>
            {sixMonthData.map((row, idx) => (
              <tr key={idx} className={`border-b border-gray-50 ${idx === 5 ? 'bg-pink-50/30 font-bold' : ''}`}>
                <td className="py-2">{row.month}</td>
                <td className="py-2 text-right text-mint-500">{row.income > 0 ? row.income.toLocaleString() : '-'}</td>
                <td className="py-2 text-right text-pink-400">{row.expense > 0 ? row.expense.toLocaleString() : '-'}</td>
                <td className={`py-2 text-right font-bold ${row.balance >= 0 ? 'text-sky-500' : 'text-pink-400'}`}>
                  {row.income > 0 || row.expense > 0 ? row.balance.toLocaleString() : '-'}
                </td>
                <td className={`py-2 text-right ${row.savingsRate >= 20 ? 'text-mint-500' : row.savingsRate >= 0 ? 'text-gray-600' : 'text-pink-400'}`}>
                  {row.income > 0 ? row.savingsRate + '%' : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
