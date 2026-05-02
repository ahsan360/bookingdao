import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'BookingDeo — Multi-tenant booking & payments infrastructure',
    description: 'BookingDeo is a complete platform for accepting appointments online: scheduling, branded subdomains, online payments and customer records — built on a multi-tenant architecture.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
