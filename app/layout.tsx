import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { CustomCursor } from '@/components/CustomCursor'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import LastVisited from '@/components/LastVisited'
import PageTracker from '@/components/PageTracker'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: 'CICCL | Professional Quantity Surveyor, project manager, and construction manager',
  description: 'Expert quantity surveying services for construction projects. Cost planning, budget management, and contract administration by certified professional.',
  keywords: ['Quantity Surveyor', 'Cost Planning', 'Project Control', 'Budget Management', 'Nigeria'],
  authors: [{ name: 'CICCL' }],
  creator: 'CICCL',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://ciccl.vercel.app',
    title: 'CICCL | Professional Quantity Surveyor, project manager, and construction manager',
    description: 'Expert quantity surveying and project management services',
    siteName: 'CICCL Quantity Surveyors',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CICCL | Professional Quantity Surveyor, project manager, and construction manager',
    description: 'Expert quantity surveying services',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0B0B0B',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`} suppressHydrationWarning>
        <CustomCursor />
        <ServiceWorkerRegistration />
        <LastVisited />
        <PageTracker />
        {children}
        <Toaster richColors position="top-right" closeButton />
        <Analytics />
      </body>
    </html>
  )
}