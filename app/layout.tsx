import type { Metadata, Viewport } from 'next'
import { Noto_Sans_TC } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import Header from './components/Header/Header'
import ThemeColorMeta from './components/ThemeColorMeta'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { HeaderProvider } from './contexts/HeaderContext'
import { HEADER_SCROLL_CONFIG } from './components/Header/headerScrollConfig'
import './styles/_colors.scss'

const notoSansTC = Noto_Sans_TC({
  variable: '--font-noto-sans-tc',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '中臺機器人研究社｜Robot Research Club of CTUST',
  applicationName: '中臺機器人研究社',
  description:
    '一個由中臺科技大學學生組成的社團，主要研究機器人技術，並且提供學生一個學習機器人技術的平台。',
  icons: {
    icon: [
      {
        url: '/assets/icons/web-icon/robotctust-web-icon-1024.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
      {
        url: '/assets/icons/web-icon/robotctust-web-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        url: '/assets/icons/web-icon/robotctust-web-icon-256.png',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        url: '/assets/icons/web-icon/robotctust-web-icon-128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        url: '/assets/icons/web-icon/robotctust-web-icon-64.png',
        sizes: '64x64',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/assets/icons/app-icon/robotctust-app-icon-1024.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
      {
        url: '/assets/icons/app-icon/robotctust-app-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/assets/icons/app-icon/robotctust-app-icon-180.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        url: '/assets/icons/app-icon/robotctust-app-icon-167.png',
        sizes: '167x167',
        type: 'image/png',
      },
      {
        url: '/assets/icons/app-icon/robotctust-app-icon-128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        url: '/assets/icons/app-icon/robotctust-app-icon-120.png',
        sizes: '120x120',
        type: 'image/png',
      },
      {
        url: '/assets/icons/app-icon/robotctust-app-icon-76.png',
        sizes: '76x76',
        type: 'image/png',
      },
      {
        url: '/assets/icons/app-icon/robotctust-app-icon-57.png',
        sizes: '57x57',
        type: 'image/png',
      },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <GoogleAnalytics gaId="G-GRP0752WNN" />
      <Analytics />
      <SpeedInsights />
      <body className={`${notoSansTC.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <HeaderProvider config={HEADER_SCROLL_CONFIG}>
              <ThemeColorMeta />
              <Header />
              {children}
            </HeaderProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
