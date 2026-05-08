'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Investment } from '@/lib/types'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import AmountInput from '@/components/AmountInput'

const COLORS = ['#A8E6CF', '#87CEEB', '#FF9BB5', '#C8B8E8', '#FFF3B0', '#FFAA80']
const ASSET_ICONS: Record<string, string> = {
  '現金': '💴', '防衛資金': '🛡️', 'NISA': '📊', '株式': '📈', 'iDeCo': '🏦', '暗号資産': '🪙',
}

export default function InvestmentsPage() {
  const { data, dispatch } = useStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Investment[]>(data.investments)

  const totalAssets = data.investments.reduce((s, i) => s + i.amount, 0)
  const investmentAssets = data.investments.filter(i => !['現金', '防衛資金'].includes(i.name)).reduce((s, i) => s + i.amount, 0)
  const investmentRate = totalAssets > 0 ? investmentAssets / totalAssets * 100 : 0

  const pieData = data.investments.map(i => ({
    name: i.name, value: i.amount,
  })).filter(d => d.value > 0)

  const saveInvestments = () => {
    dispatch({ type: 'UPDATE_INVESTMENTS', investments: form })
    setEditing(false)
  }

  const updateFormItem = (idx: number, field: keyof Investment, value: number) => {
    setForm(form.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const totalFormPercent = form.reduce((s, i) => s + i.targetPercent, 0)

  return (
    <div className="p-4 lg:p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-sky-500">📈 投資 / 資産</h2>
        <button onClick={() => { setForm(data.investments); setEditing(!editing) }}
          className="bg-sky-300 hover:bg-sky-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          {editing ? '✕ キャンセル' : '✏️ 編集'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="card border-2 border-sky-200 text-center py-3">
          <p className="text-xs text-gray-500">総資産</p>
          <p className="text-base font-bold text-sky-500">{(totalAssets / 10000).toFixed(0)}<span className="text-xs text-gray-400">万円</span></p>
        </div>
        <div className="card border-2 border-lavender-200 text-center py-3">
          <p className="text-xs text-gray-500">投資資産</p>
          <p className="text-base font-bold text-lavender-400">{(investmentAssets / 10000).toFixed(0)}<span className="text-xs text-gray-400">万円</span></p>
        </div>
        <div className="card border-2 border-mint-200 text-center py-3">
          <p className="text-xs text-gray-500">投資比率</p>
          <p className={`text-base font-bold ${investmentRate >= 30 ? 'text-mint-500' : 'text-gray-600'}`}>
            {investmentRate.toFixed(1)}<span className="text-xs text-gray-400">%</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pie chart */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-600 mb-3">資産配分 (現在)</h3>
          {totalAssets > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${(Number(v) / 10000).toFixed(1)}万円`, '']} />
                <Legend formatter={v => v} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">資産データを入力してください</div>
          )}
          <div className="text-center mt-2">
            <p className="text-xs text-gray-400">総資産: {(totalAssets / 10000).toFixed(1)}万円</p>
          </div>
        </div>

        {/* Asset table */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-600 mb-3">目標% vs 実際%</h3>
          <div className="space-y-3">
            {data.investments.map((inv, idx) => {
              const actualPct = totalAssets > 0 ? inv.amount / totalAssets * 100 : 0
              const diff = actualPct - inv.targetPercent
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">
                      {ASSET_ICONS[inv.name] || '💰'} {inv.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">目標: {inv.targetPercent}%</span>
                      <span className="font-bold text-gray-700">実際: {actualPct.toFixed(1)}%</span>
                      <span className={`font-bold ${Math.abs(diff) < 3 ? 'text-mint-500' : diff > 0 ? 'text-pink-400' : 'text-sky-500'}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 progress-bar">
                      <div className="progress-fill" style={{ width: `${actualPct}%`, background: COLORS[idx % COLORS.length] }} />
                    </div>
                    <span className="text-xs text-gray-400 w-16 text-right">{(inv.amount / 10000).toFixed(1)}万</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Monthly targets */}
      <div className="card mt-4">
        <h3 className="text-sm font-bold text-gray-600 mb-3">月次積立目標</h3>
        <div className="grid sm:grid-cols-3 gap-2">
          {data.investments.filter(i => i.monthlyTarget > 0).map((inv, idx) => (
            <div key={idx} className="p-3 rounded-xl text-center" style={{ background: COLORS[data.investments.indexOf(inv) % COLORS.length] + '40' }}>
              <p className="text-sm font-bold text-gray-700">{ASSET_ICONS[inv.name] || '💰'} {inv.name}</p>
              <p className="text-lg font-bold text-gray-800">{inv.monthlyTarget.toLocaleString()}<span className="text-xs">円/月</span></p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100 text-right">
          <span className="text-xs text-gray-500">月次投資合計: </span>
          <span className="font-bold text-sky-500">{data.investments.reduce((s, i) => s + i.monthlyTarget, 0).toLocaleString()}円/月</span>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="card mt-4 border-2 border-sky-200">
          <h3 className="text-sm font-bold text-sky-500 mb-4">資産データを編集</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[480px]">
              <thead>
                <tr className="border-b border-sky-100">
                  <th className="text-left py-2 text-gray-500">資産種別</th>
                  <th className="text-right py-2 text-gray-500">現在額</th>
                  <th className="text-right py-2 text-gray-500">目標%</th>
                  <th className="text-right py-2 text-gray-500">月積立</th>
                </tr>
              </thead>
              <tbody>
                {form.map((inv, idx) => (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="py-2 font-medium">{ASSET_ICONS[inv.name] || '💰'} {inv.name}</td>
                    <td className="py-2">
                      <AmountInput value={inv.amount} onChange={v => updateFormItem(idx, 'amount', v)} />
                    </td>
                    <td className="py-2">
                      <input type="number" min={0} max={100} value={inv.targetPercent} onChange={e => updateFormItem(idx, 'targetPercent', +e.target.value)} className="input-cell w-20 text-center" title={`${inv.name} 目標%`} placeholder="0" />
                    </td>
                    <td className="py-2">
                      <AmountInput value={inv.monthlyTarget} onChange={v => updateFormItem(idx, 'monthlyTarget', v)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={`mt-2 text-xs text-right ${totalFormPercent !== 100 ? 'text-pink-400' : 'text-mint-500'}`}>
            目標% 合計: {totalFormPercent}% {totalFormPercent !== 100 && '(100%になるよう調整してください)'}
          </div>
          <button onClick={saveInvestments} className="mt-3 w-full bg-sky-300 hover:bg-sky-400 text-white py-2 rounded-xl font-bold text-sm">保存する</button>
        </div>
      )}
    </div>
  )
}
