import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '../../components/ThemeProvider' // Pfad beibehalten
import { Footer } from '../../components/Footer' // Footer importieren (Pfad anpassen, falls nötig)

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
        Flexbox-Layout für den Body, damit der Footer nach unten geschoben wird.
        min-h-screen stellt sicher, dass der Body mindestens die Bildschirmhöhe einnimmt.
      */}
      <body className={`${inter.className} flex flex-col min-h-screen transition-colors duration-200`}>
        <ThemeProvider> {/* ThemeProvider umschließt alles */}
          {/*
            Hauptinhalt der Seite.
            flex-grow sorgt dafür, dass dieser Bereich den verfügbaren Platz einnimmt
            und den Footer nach unten drückt.
          */}
          <main className="flex-grow">
            {children}
          </main>
          <Footer /> {/* Footer am Ende, aber innerhalb des ThemeProviders */}
        </ThemeProvider>
      </body>
    </html>
  )
}
