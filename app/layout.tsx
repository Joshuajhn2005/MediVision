import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Sora, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { CursorProvider } from '@/lib/cursor-context'
import { CustomCursor } from '@/components/custom-cursor'

const display = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'MedVision AI — Radiology Intelligence',
  description:
    'AI-powered radiology assistant delivering instant preliminary scan analysis powered by deep learning. Preliminary findings only — not a replacement for a qualified radiologist.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050b14',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark bg-background ${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased custom-cursor-active">
        <CursorProvider>
          <CustomCursor />
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </CursorProvider>
      </body>
    </html>
  )
}
