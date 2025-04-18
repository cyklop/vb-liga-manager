'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navbar'
import UserProfileForm from '@/components/UserProfileForm'
// ThemeProvider entfernt, nur useTheme wird benötigt
import { useTheme } from '@/components/ThemeProvider';
import { toast } from 'react-toastify';
// Importiere den zentralen User-Typ
import type { UserProfile } from '@/types/models';

// Lokales User Interface entfernt

// Logik direkt in die Hauptkomponente verschoben
export default function AccountPage() {
  // Verwende den importierten Typ
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance'>('profile'); // State für aktiven Tab
  const router = useRouter()
  const { theme, setTheme } = useTheme() // Destrukturieren für einfacheren Zugriff

  useEffect(() => {
    setMounted(true) // Markiert, dass die Komponente client-seitig gemountet ist
    fetchUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Läuft einmal nach dem Mounten

  const fetchUser = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)

        // Entfernt: Der Kontext wird vom Root-Provider initialisiert.
        // Das Dropdown liest den Wert direkt aus dem Kontext.
      } else if (response.status === 401) {
        // Nicht authentifiziert, zur Login-Seite weiterleiten
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzerprofils', error)
      // Optional: Weiterleitung nur bei bestimmten Fehlern
      // router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // Verwende Partial<UserProfile>
  const handleProfileUpdate = async (updatedUser: Partial<UserProfile>) => {
    // Nur fortfahren, wenn Benutzerdaten geladen sind
    if (!user) return;

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      })
      if (response.ok) {
        const data = await response.json()
       // Lokalen Benutzerstatus mit der Antwort vom Server aktualisieren
       setUser(prevUser => prevUser ? { ...prevUser, ...data } : null)
       toast.success('Profil erfolgreich aktualisiert!'); // Erfolgs-Toast
     } else {
       // Fehler bei der Aktualisierung behandeln (z.B. Nachricht anzeigen)
       const errorData = await response.json().catch(() => ({ message: response.statusText })); // Versuche, JSON zu parsen, sonst Status-Text
       console.error('Fehler beim Aktualisieren des Profils:', errorData.message || response.statusText);
       toast.error(`Fehler: ${errorData.message || 'Profil konnte nicht aktualisiert werden.'}`); // Fehler-Toast
     }
   } catch (error) {
     console.error('Fehler beim Aktualisieren des Benutzerprofils', error)
     toast.error('Ein Netzwerk- oder Serverfehler ist aufgetreten.'); // Netzwerkfehler-Toast
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          {/* DaisyUI Spinner */}
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </>
    )
  }

  // Rendert erst, wenn client-seitig gemountet, um Hydration-Fehler zu vermeiden
  if (!mounted) {
    return null; // Oder eine minimale Ladeanzeige
  }

  return (
    <>
      <Navigation />
      <header className="shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">Mein Konto</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Padding kann ggf. angepasst werden */}
          <div className="px-4 py-6 sm:px-0">
            {/* DaisyUI Card */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body"> {/* Innenabstand der Karte */}

                {/* Tab-Container */}
                <div role="tablist" className="tabs tabs-lifted">
                  <button
                    role="tab"
                    className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    Profil
                  </button>
                  <button
                    role="tab"
                    className={`tab ${activeTab === 'appearance' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('appearance')}
                  >
                    Darstellung
                  </button>
                </div>

                {/* Tab-Inhalt */}
                <div className="mt-4"> {/* Abstand zwischen Tabs und Inhalt */}
                  {/* Profil-Tab Inhalt */}
                  {activeTab === 'profile' && user && (
                    <UserProfileForm user={user} onUpdate={handleProfileUpdate} />
                  )}

                  {/* Darstellungs-Tab Inhalt */}
                  {activeTab === 'appearance' && (
                    <div className="pt-6"> {/* Padding für den Inhalt des Tabs */}
                      <h2 className="text-2xl font-bold mb-4 card-title">Darstellung</h2>
                      <p className="mt-2 mb-4 text-sm">
                        Wählen Sie Ihr bevorzugtes Erscheinungsbild für die Anwendung.
                      </p>
                      {/* DaisyUI Form Control für Select */}
                      <div className="form-control w-full max-w-xs"> {/* Container für das Formularelement */}
                        <label className="label" htmlFor="theme"> {/* Label */}
                          <span className="label-text">Theme-Einstellung</span>
                        </label>
                        {mounted && ( /* mounted Check beibehalten */
                          <select
                            id="theme"
                            className="select select-bordered w-full" /* DaisyUI Klassen */
                            value={theme}
                            onChange={(e) => {
                              const newTheme = e.target.value as 'light' | 'dark' | 'system';
                              setTheme(newTheme);
                              handleProfileUpdate({ theme: newTheme });
                            }}
                          >
                            <option value="light">Hell</option>
                            <option value="dark">Dunkel</option>
                            <option value="system">System (Browser-Einstellung)</option>
                          </select>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div> {/* Ende card-body */}
            </div> {/* Ende card */}
          </div>
        </div>
      </main>
    </>
  )
} // Fehlende schließende Klammer für AccountPage hinzugefügt
// Redundanter ThemeProvider-Wrapper und AccountContent-Referenz entfernt
