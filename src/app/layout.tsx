import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider' // Pfad auf Alias geändert
import { Footer } from '@/components/Footer' // Pfad auf Alias geändert
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // CSS Import hinzufügen

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
    // suppressHydrationWarning entfernt, da ThemeProvider das data-theme Attribut verwaltet
    <html lang="de">
      {/*
        Padding am Body, um Platz für den fixierten Footer zu schaffen.
      */}
      <body className={`${inter.className} pb-10 transition-colors duration-200`}> {/* pb-10 hinzugefügt, Flexbox entfernt */}
        <ThemeProvider> {/* ThemeProvider umschließt alles */}
          {/*
            Hauptinhalt der Seite.
            Kein grow mehr nötig.
          */}
          <main> {/* grow entfernt */}
            {children}
          </main>
          <Footer /> {/* Footer wird durch CSS fixiert */}
          {/* ToastContainer konfiguriert für oben rechts mit Abstand */}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            className="mt-16" // Fügt Abstand von oben hinzu (Tailwind: mt-16 = 4rem = 64px)
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
