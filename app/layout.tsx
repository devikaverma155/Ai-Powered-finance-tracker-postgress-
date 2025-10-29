import { Metadata } from 'next'
import { AuthProvider } from '../lib/auth-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Finance Planner',
  description: 'Track and plan your finances with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main className="max-w-4xl mx-auto p-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
