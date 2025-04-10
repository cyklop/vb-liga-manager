import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider' // Pfad auf Alias geändert
import { Footer } from '@/components/Footer' // Pfad auf Alias geändert

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
      {/*
        Padding am Body, um Platz für den fixierten Footer zu schaffen.
      */}
      <body className={`${inter.className} pb-10 transition-colors duration-200`}> {/* pb-10 hinzugefügt, Flexbox entfernt */}
        <ThemeProvider> {/* ThemeProvider umschließt alles */}
          {/*
            Hauptinhalt der Seite.
            Kein flex-grow mehr nötig.
          */}
          <main> {/* flex-grow entfernt */}
            {children}
          </main>
          <Footer /> {/* Footer wird durch CSS fixiert */}
        </ThemeProvider>
      </body>
    </html>
  )
}
