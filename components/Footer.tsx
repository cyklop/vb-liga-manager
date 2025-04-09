'use client' // Diese Komponente benötigt Client-seitige Interaktivität

import React, { useEffect, useState } from 'react' // useContext entfernt
import { useTheme } from './ThemeProvider' // Importiere den useTheme Hook
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline' // Beispiel-Icons

export function Footer() {
  // Verwende den useTheme Hook statt useContext direkt
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Wichtig: Rendere nichts oder einen Platzhalter, bis die Komponente gemountet ist,
  // um Hydration Mismatches zu vermeiden. Der Hook stellt sicher, dass der Kontext existiert.
  if (!mounted) {
    // Du kannst hier auch einen einfachen Platzhalter-Footer rendern,
    // falls das Layout darauf angewiesen ist.
    // z.B. <footer className="h-10 mt-auto"></footer>
    return null;
  }

  // theme und setTheme kommen jetzt direkt vom useTheme Hook

  // Bestimme das *effektive* Theme (light oder dark) für die Icon-Anzeige.
  // Wenn 'system' gewählt ist, prüfe die Systemeinstellung des Browsers.
  let effectiveTheme = theme;
  if (theme === 'system') {
    // Diese Prüfung funktioniert nur auf dem Client nach dem Mounten.
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Toggle-Funktion: Schaltet immer explizit zwischen 'light' und 'dark' um.
  // Wenn der Benutzer auf den Button klickt, wird 'system' überschrieben.
  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs print:hidden"> {/* print:hidden, um im Druck auszublenden */}
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <span>
          Made with AI {/* Dein gewünschter Text */}
        </span>
        <button
          onClick={toggleTheme}
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={effectiveTheme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
        >
          {/* Zeige das Icon basierend auf dem effektiven Theme an */}
          {effectiveTheme === 'dark' ? (
            <SunIcon className="h-4 w-4 text-yellow-400" />
          ) : (
            <MoonIcon className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>
    </footer>
  )
}
