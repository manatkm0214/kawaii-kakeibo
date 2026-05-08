'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: '🏠' },
  { href: '/kpi', label: 'KPI分析', icon: '📊' },
  { href: '/budget', label: '予算管理', icon: '💰' },
  { href: '/calendar', label: 'カレンダー', icon: '📅' },
  { href: '/transactions', label: '取引履歴', icon: '📝' },
  { href: '/tasks', label: 'タスク管理', icon: '✅' },
  { href: '/subscriptions', label: '引落予約', icon: '🔔' },
  { href: '/savings', label: '貯蓄目標', icon: '🎯' },
  { href: '/investments', label: '投資/資産', icon: '📈' },
  { href: '/purchase-advice', label: '購入アドバイス', icon: '🛍️' },
  { href: '/reports', label: '月次レポート', icon: '📑' },
  { href: '/settings', label: '設定', icon: '⚙️' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-52 min-h-screen bg-white border-r border-pink-100 fixed left-0 top-0 z-30 shadow-sm">
        <div className="px-4 py-5 border-b border-pink-100">
          <h1 className="text-lg font-bold text-pink-400 leading-tight">
            ☆ かわいい<br />家計簿
          </h1>
          <p className="text-xs text-pink-300 mt-1">プロ版</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors rounded-lg mx-2 my-0.5
                ${pathname === item.href
                  ? 'bg-pink-100 text-pink-500 font-semibold'
                  : 'text-gray-600 hover:bg-pink-50 hover:text-pink-400'}`}
            >
              <span className="text-base w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-pink-100 text-xs text-pink-200 text-center">
          毎日のお金管理を楽しく♪
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-pink-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-base font-bold text-pink-400">☆ かわいい家計簿</h1>
          <button
            onClick={() => setOpen(!open)}
            className="text-pink-400 p-1 rounded-lg hover:bg-pink-50"
          >
            <span className="text-xl">{open ? '✕' : '☰'}</span>
          </button>
        </div>
        {open && (
          <nav className="bg-white border-t border-pink-50 pb-2 max-h-[80vh] overflow-y-auto">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors
                  ${pathname === item.href
                    ? 'bg-pink-50 text-pink-500 font-semibold'
                    : 'text-gray-600 hover:bg-pink-50'}`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </>
  )
}
