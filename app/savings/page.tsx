'use client'
import { useState } from 'react'
import { useStore, useMonthSummary } from '@/lib/store'
import { SavingsGoal } from '@/lib/types'
import AmountInput from '@/components/AmountInput'

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, value / max * 100) : 0
  return (
    <div className="progress-bar my-2">
      <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function monthsUntil(current: number, target: number, monthly: number) {
  if (monthly <= 0) return null
  const remaining = target - current
  if (remaining <= 0) return 0
  return Math.ceil(remaining / monthly)
}

function futureDate(months: number) {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

export default function SavingsPage() {
  const { data, dispatch } = useStore()
  const { expense } = useMonthSummary()
  const g = data.savingsGoal
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<SavingsGoal>(g)

  const emergencyTarget = g.emergencyMonths * (expense || 150000)
  const savingsMonths = monthsUntil(g.savingsCurrent, g.savingsTarget, g.savingsMonthly)
  const emergencyMonths = monthsUntil(g.emergencyCurrent, emergencyTarget, g.emergencyMonthly)

  const savePct = g.savingsTarget > 0 ? Math.min(100, g.savingsCurrent / g.savingsTarget * 100) : 0
  const emergencyPct = emergencyTarget > 0 ? Math.min(100, g.emergencyCurrent / emergencyTarget * 100) : 0

  const saveGoal = () => {
    dispatch({ type: 'UPDATE_SAVINGS', goal: form })
    setEditing(false)
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-mint-500">🎯 貯蓄目標</h2>
        <button onClick={() => { setForm(g); setEditing(!editing) }}
          className="bg-mint-300 hover:bg-mint-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          {editing ? '✕ キャンセル' : '✏️ 編集'}
        </button>
      </div>

      {editing ? (
        <div className="card mb-5">
          <h3 className="text-sm font-bold text-gray-600 mb-4">目標を設定</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-mint-500">先取貯金</h4>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">目標額</label>
                <AmountInput value={form.savingsTarget} onChange={v => setForm({ ...form, savingsTarget: v })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">現在の達成額</label>
                <AmountInput value={form.savingsCurrent} onChange={v => setForm({ ...form, savingsCurrent: v })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">毎月の積立予定額</label>
                <AmountInput value={form.savingsMonthly} onChange={v => setForm({ ...form, savingsMonthly: v })} />
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-sky-500">生活防衛資金</h4>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">目標月数 (推奨: 6ヶ月)</label>
                <input type="number" value={form.emergencyMonths} onChange={e => setForm({ ...form, emergencyMonths: +e.target.value })} className="input-cell" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">現在の防衛資金額</label>
                <AmountInput value={form.emergencyCurrent} onChange={v => setForm({ ...form, emergencyCurrent: v })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">毎月の積立予定額</label>
                <AmountInput value={form.emergencyMonthly} onChange={v => setForm({ ...form, emergencyMonthly: v })} />
              </div>
            </div>
          </div>
          <button onClick={saveGoal} className="mt-4 w-full bg-mint-300 hover:bg-mint-400 text-white py-2 rounded-xl font-bold">保存する</button>
        </div>
      ) : null}

      {/* Savings Goal Card */}
      <div className="card border-2 border-mint-200 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-mint-500">🐷 先取貯金</h3>
            <p className="text-xs text-gray-400 mt-0.5">給料日に先に貯金する習慣</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-mint-500">{savePct.toFixed(1)}<span className="text-sm text-gray-400">%</span></p>
            <p className="text-xs text-gray-400">達成率</p>
          </div>
        </div>

        <ProgressBar value={g.savingsCurrent} max={g.savingsTarget} color="bg-mint-300" />

        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div>
            <p className="text-xs text-gray-500">目標額</p>
            <p className="text-sm font-bold text-gray-700">{g.savingsTarget.toLocaleString()}<span className="text-xs text-gray-400">円</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500">現在額</p>
            <p className="text-sm font-bold text-mint-500">{g.savingsCurrent.toLocaleString()}<span className="text-xs text-gray-400">円</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500">残り</p>
            <p className="text-sm font-bold text-gray-700">{Math.max(0, g.savingsTarget - g.savingsCurrent).toLocaleString()}<span className="text-xs text-gray-400">円</span></p>
          </div>
        </div>

        <div className="mt-3 p-3 bg-mint-50 rounded-xl">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">毎月 {g.savingsMonthly.toLocaleString()}円 積立中</span>
            {savingsMonths !== null && (
              <span className="font-bold text-mint-500">
                {savingsMonths === 0 ? '🎉 目標達成！' : `達成予定: ${futureDate(savingsMonths)}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Fund Card */}
      <div className="card border-2 border-sky-200 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-sky-500">🛡️ 生活防衛資金</h3>
            <p className="text-xs text-gray-400 mt-0.5">緊急時に備える {g.emergencyMonths}ヶ月分の生活費</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-sky-500">{emergencyPct.toFixed(1)}<span className="text-sm text-gray-400">%</span></p>
            <p className="text-xs text-gray-400">達成率</p>
          </div>
        </div>

        <ProgressBar value={g.emergencyCurrent} max={emergencyTarget} color="bg-sky-300" />

        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div>
            <p className="text-xs text-gray-500">目標額</p>
            <p className="text-sm font-bold text-gray-700">{emergencyTarget.toLocaleString()}<span className="text-xs text-gray-400">円</span></p>
            <p className="text-[10px] text-gray-400">({g.emergencyMonths}ヶ月×月支出)</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">現在額</p>
            <p className="text-sm font-bold text-sky-500">{g.emergencyCurrent.toLocaleString()}<span className="text-xs text-gray-400">円</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500">残り</p>
            <p className="text-sm font-bold text-gray-700">{Math.max(0, emergencyTarget - g.emergencyCurrent).toLocaleString()}<span className="text-xs text-gray-400">円</span></p>
          </div>
        </div>

        <div className="mt-3 p-3 bg-sky-50 rounded-xl">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">毎月 {g.emergencyMonthly.toLocaleString()}円 積立中</span>
            {emergencyMonths !== null && (
              <span className="font-bold text-sky-500">
                {emergencyMonths === 0 ? '🎉 目標達成！' : `達成予定: ${futureDate(emergencyMonths)}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className="p-4 bg-cream rounded-2xl border border-lemon-300">
        <h3 className="text-xs font-bold text-yellow-700 mb-2">💡 おすすめの積立順序</h3>
        <ol className="text-xs text-yellow-800 space-y-1">
          <li>① まず生活防衛資金を6ヶ月分貯める</li>
          <li>② NISA・iDeCoを満額活用する</li>
          <li>③ その後、目標に向けた先取貯金を増やす</li>
          <li>④ 余剰資金で追加投資や目標貯蓄</li>
        </ol>
      </div>
    </div>
  )
}
