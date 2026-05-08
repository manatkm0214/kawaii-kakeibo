'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Task } from '@/lib/types'

const TYPE_LABELS: Record<number, { label: string; color: string; icon: string }> = {
  0: { label: 'その他', color: 'bg-gray-100 text-gray-500', icon: '📌' },
  1: { label: '入金', color: 'bg-mint-100 text-mint-500', icon: '💵' },
  2: { label: '出金', color: 'bg-pink-100 text-pink-400', icon: '💳' },
  3: { label: '振込', color: 'bg-sky-100 text-sky-500', icon: '🏦' },
  4: { label: '引落', color: 'bg-lavender-100 text-lavender-400', icon: '🔔' },
  5: { label: '支払', color: 'bg-peach-100 text-peach-400', icon: '📄' },
  6: { label: '貯金', color: 'bg-mint-100 text-mint-500', icon: '🐷' },
  7: { label: '投資', color: 'bg-sky-100 text-sky-500', icon: '📈' },
  8: { label: '返金', color: 'bg-lemon-100 text-yellow-600', icon: '↩️' },
  9: { label: '返済', color: 'bg-peach-100 text-peach-400', icon: '💰' },
}

function daysUntil(dateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = dateStr.split('/').map(Number)
  const target = new Date(y, m - 1, d)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function CountdownBadge({ dateStr }: { dateStr: string }) {
  const days = daysUntil(dateStr)
  if (days < 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-500 font-bold">{-days}日超過</span>
  if (days === 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-peach-200 text-peach-500 font-bold animate-pulse">今日！</span>
  if (days <= 3) return <span className="text-xs px-2 py-0.5 rounded-full bg-lemon-300 text-yellow-700 font-bold">あと{days}日</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">あと{days}日</span>
}

function newTask(): Partial<Task> {
  const today = new Date()
  return { typeCode: 2, status: 'pending', priority: 3, dueDate: `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`, note: '' }
}

export default function TasksPage() {
  const { data, dispatch } = useStore()
  const [editTask, setEditTask] = useState<Partial<Task> | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'done' | 'skipped'>('all')

  const tasks = data.tasks.filter(t => filter === 'all' || t.status === filter)
    .sort((a, b) => {
      const statusOrder = { pending: 0, done: 1, skipped: 2 }
      if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status]
      return daysUntil(a.dueDate) - daysUntil(b.dueDate)
    })

  const totalIn = data.tasks.filter(t => t.status === 'pending' && [1, 8].includes(t.typeCode)).reduce((s, t) => s + t.amount, 0)
  const totalOut = data.tasks.filter(t => t.status === 'pending' && [2, 4, 5, 9].includes(t.typeCode)).reduce((s, t) => s + t.amount, 0)
  const doneCount = data.tasks.filter(t => t.status === 'done').length
  const completionRate = data.tasks.length > 0 ? (doneCount / data.tasks.length * 100) : 0

  const saveTask = () => {
    if (!editTask?.name || !editTask.dueDate) return
    const task: Task = {
      id: editTask.id || Date.now().toString(),
      typeCode: editTask.typeCode ?? 2,
      name: editTask.name,
      amount: editTask.amount || 0,
      dueDate: editTask.dueDate,
      status: editTask.status || 'pending',
      priority: editTask.priority || 3,
      note: editTask.note || '',
    }
    if (editTask.id) {
      dispatch({ type: 'UPDATE_TASK', task })
    } else {
      dispatch({ type: 'ADD_TASK', task })
    }
    setEditTask(null)
  }

  const toggleStatus = (task: Task) => {
    const next = task.status === 'pending' ? 'done' : task.status === 'done' ? 'skipped' : 'pending'
    dispatch({ type: 'UPDATE_TASK', task: { ...task, status: next } })
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-xl font-bold text-peach-400">✅ タスク管理</h2>
        <button onClick={() => setEditTask(newTask())}
          className="bg-peach-300 hover:bg-peach-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          ＋ タスクを追加
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <div className="card border border-gray-100 text-center py-2">
          <p className="text-xs text-gray-500">総数</p>
          <p className="text-lg font-bold text-gray-700">{data.tasks.length}件</p>
        </div>
        <div className="card border border-mint-200 bg-mint-50 text-center py-2">
          <p className="text-xs text-gray-500">完了率</p>
          <p className="text-lg font-bold text-mint-500">{completionRate.toFixed(0)}%</p>
        </div>
        <div className="card border border-mint-200 bg-mint-50 text-center py-2">
          <p className="text-xs text-gray-500">予定入金</p>
          <p className="text-sm font-bold text-mint-500">+{totalIn.toLocaleString()}</p>
        </div>
        <div className="card border border-pink-200 bg-pink-50 text-center py-2">
          <p className="text-xs text-gray-500">予定出金</p>
          <p className="text-sm font-bold text-pink-400">-{totalOut.toLocaleString()}</p>
        </div>
      </div>

      {/* Type legend */}
      <div className="card mb-4">
        <p className="text-xs text-gray-500 mb-2">タスクタイプ一覧（数字で自動判定）</p>
        <div className="flex flex-wrap gap-1">
          {Object.entries(TYPE_LABELS).map(([code, info]) => (
            <span key={code} className={`text-xs px-2 py-0.5 rounded-full ${info.color}`}>
              {code}: {info.icon}{info.label}
            </span>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-3">
        {(['all', 'pending', 'done', 'skipped'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors
              ${filter === f ? 'bg-peach-300 text-white' : 'bg-gray-100 text-gray-500 hover:bg-peach-100'}`}>
            {f === 'all' ? '全て' : f === 'pending' ? '未了' : f === 'done' ? '完了' : 'スキップ'}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map(task => {
          const typeInfo = TYPE_LABELS[task.typeCode] || TYPE_LABELS[0]
          return (
            <div
              key={task.id}
              className={`card border transition-all ${task.status === 'done' ? 'opacity-60 bg-gray-50' : task.status === 'skipped' ? 'opacity-40' : 'border-peach-100'}`}
            >
              <div className="flex items-start gap-3">
                <button onClick={() => toggleStatus(task)} className="mt-0.5 flex-shrink-0">
                  <span className="text-xl">
                    {task.status === 'done' ? '✅' : task.status === 'skipped' ? '⏭️' : '⬜'}
                  </span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>{typeInfo.icon}{typeInfo.label}</span>
                    <span className={`text-sm font-bold ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {task.name}
                    </span>
                    {'★'.repeat(task.priority).padEnd(5, '☆').split('').map((s, i) => (
                      <span key={i} className="text-xs">{s === '★' ? '⭐' : '☆'}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {task.amount > 0 && (
                      <span className={[1, 8].includes(task.typeCode) ? 'text-mint-500 font-bold' : 'text-pink-400 font-bold'}>
                        {[1, 8].includes(task.typeCode) ? '+' : '-'}{task.amount.toLocaleString()}円
                      </span>
                    )}
                    <span>📅 {task.dueDate}</span>
                    <CountdownBadge dateStr={task.dueDate} />
                    {task.note && <span className="text-gray-400">📝 {task.note}</span>}
                  </div>
                </div>
                <button onClick={() => setEditTask(task)} className="text-gray-300 hover:text-peach-400 flex-shrink-0">✏️</button>
              </div>
            </div>
          )
        })}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">タスクがありません</div>
        )}
      </div>

      {/* Modal */}
      {editTask && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-peach-400 mb-4">{editTask.id ? 'タスクを編集' : 'タスクを追加'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">タイプ (0-9)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={9} value={editTask.typeCode ?? 2}
                    onChange={e => setEditTask({ ...editTask, typeCode: +e.target.value })}
                    className="input-cell w-16 text-center text-lg font-bold" />
                  <span className={`text-sm px-2 py-1 rounded-lg ${TYPE_LABELS[editTask.typeCode ?? 2]?.color}`}>
                    {TYPE_LABELS[editTask.typeCode ?? 2]?.icon}{TYPE_LABELS[editTask.typeCode ?? 2]?.label}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">項目名 *</label>
                <input type="text" value={editTask.name || ''} onChange={e => setEditTask({ ...editTask, name: e.target.value })} className="input-cell" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">金額</label>
                  <input type="number" value={editTask.amount || ''} onChange={e => setEditTask({ ...editTask, amount: +e.target.value })} className="input-cell" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">期日 *</label>
                  <input type="text" placeholder="yyyy/m/d" value={editTask.dueDate || ''} onChange={e => setEditTask({ ...editTask, dueDate: e.target.value })} className="input-cell" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ステータス</label>
                  <select value={editTask.status || 'pending'} onChange={e => setEditTask({ ...editTask, status: e.target.value as Task['status'] })} className="input-cell">
                    <option value="pending">未了</option>
                    <option value="done">完了</option>
                    <option value="skipped">スキップ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">優先度 (1-5)</label>
                  <input type="number" min={1} max={5} value={editTask.priority || 3} onChange={e => setEditTask({ ...editTask, priority: +e.target.value })} className="input-cell text-center" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">メモ</label>
                <input type="text" value={editTask.note || ''} onChange={e => setEditTask({ ...editTask, note: e.target.value })} className="input-cell" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveTask} className="flex-1 bg-peach-300 hover:bg-peach-400 text-white py-2 rounded-xl text-sm font-bold">保存</button>
              {editTask.id && (
                <button onClick={() => { dispatch({ type: 'DELETE_TASK', id: editTask.id! }); setEditTask(null) }}
                  className="px-3 bg-red-50 hover:bg-red-100 text-red-400 rounded-xl text-sm">削除</button>
              )}
              <button onClick={() => setEditTask(null)} className="px-3 bg-gray-100 text-gray-500 rounded-xl text-sm">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
