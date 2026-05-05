import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Navigator Home Inspections LLC',
  description: 'Professional home inspection management system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply theme + lang before React hydrates to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('hi-theme');
              var l = localStorage.getItem('hi-lang');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
              if (l) document.documentElement.setAttribute('data-lang', l);
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <AppProvider>
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  )
}
