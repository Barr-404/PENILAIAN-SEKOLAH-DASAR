import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from 'react-hot-toast'
import { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistem Penilaian Sekolah Dasar',
  description: 'Website untuk guru sekolah dasar dalam mengelola nilai siswa',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#363636',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                maxWidth: '400px',
                textAlign: 'center'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                }
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                }
              },
              loading: {
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #dbeafe',
                }
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}