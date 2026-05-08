import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import PrintShare from '@/components/PrintShare'
import { StoreProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: '☆ かわいい家計簿 プロ版',
  description: '毎日のお金管理を楽しく、かわいく♪',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <StoreProvider>
          <Navigation />
          <main className="lg:ml-52 pt-16 lg:pt-0 min-h-screen">
            {children}
          </main>
          <PrintShare />
        </StoreProvider>
      </body>
    </html>
  )
}
