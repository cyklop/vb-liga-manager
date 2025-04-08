import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '../../components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Volleyball Liga Manager',
  description: 'Verwaltungssystem für Volleyball Ligen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-200`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
