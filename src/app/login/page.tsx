'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LockClosedIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import Modal from '@/components/Modal'
import { signIn } from 'next-auth/react'
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false) // State für "Angemeldet bleiben"
  const [error, setError] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('') // Für Erfolgsmeldungen
  const [resetError, setResetError] = useState('') // Für Fehlermeldungen im Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Reset error message
    try {
      // Zuerst sicherstellen, dass wir vollständig abgemeldet sind
      await fetch('/api/auth/signout', { method: 'POST' });
      await fetch('/api/logout', { method: 'POST' });
      
      // Cookies im Browser löschen
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Dann versuchen, sich anzumelden mit callbackUrl für vollständige Session-Aktualisierung
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        rememberMe: rememberMe, // Wert der Checkbox übergeben
        callbackUrl: '/dashboard'
      })

      if (result?.error) {
        setError(result.error || 'Anmeldung fehlgeschlagen')
      } else {
        // Vollständigen Seitenneuladen erzwingen, um alle Session-Daten zu aktualisieren
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
    }
  }

  // Überprüfen des Login-Status mit NextAuth
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session && session.user) {
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card color="transparent" shadow={false} className="dark:bg-gray-800/30 p-6" placeholder="">
        <Typography variant="h4" color="blue-gray" className="dark:text-gray-100" placeholder="">
          Anmelden
        </Typography>
        <Typography color="gray" className="mt-1 font-normal dark:text-gray-300" placeholder="">
          Geben Sie Ihre Anmeldedaten ein, um sich anzumelden.
        </Typography>
        <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
          <div className="mb-4 flex flex-col gap-6">
            <Input 
              size="lg"
              label="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="dark:text-gray-200 dark:border-gray-500"
              placeholder=""
            />
            <Input
              type="password"
              size="lg"
              label="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="dark:text-gray-200 dark:border-gray-500"
              placeholder=""
            />
          </div>
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center font-normal dark:text-gray-300"
                placeholder=""
              >
                Angemeldet bleiben
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
            className="focus:ring-0 focus:ring-offset-0"
            placeholder=""
            iconProps={{
              className: ""
            }}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          {error && (
            <Typography color="red" className="mt-2 text-center text-sm" placeholder="">
              {error}
            </Typography>
          )}
          <Button className="mt-6" fullWidth type="submit" placeholder="">
            Anmelden
          </Button>
          <Typography color="gray" className="mt-4 text-center font-normal dark:text-gray-300" placeholder="">
            Passwort vergessen?{" "}
            <button
              type="button" // Verhindert das Absenden des Formulars
              onClick={() => setIsResetModalOpen(true)}
              className="font-medium text-blue-500 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Zurücksetzen
            </button>
          </Typography>
        </form>
        <Modal isOpen={isResetModalOpen} onClose={() => { setIsResetModalOpen(false); setResetError(''); setResetMessage(''); setResetEmail(''); }} title="Passwort zurücksetzen">
          <form onSubmit={async (e) => {
            e.preventDefault();
            setResetError(''); // Fehler zurücksetzen
            setResetMessage(''); // Erfolgsmeldung zurücksetzen
            try {
              const response = await fetch('/api/auth/request-password-reset', { // Endpunkt aktualisiert
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail }),
              })
              const data = await response.json();
              if (response.ok) {
                setResetMessage(data.message); // Erfolgsmeldung im State speichern
                // Modal nicht sofort schließen, damit die Nachricht sichtbar ist
                // setIsResetModalOpen(false); // Entfernt oder auskommentiert
              } else {
                setResetError(data.message || 'Ein Fehler ist aufgetreten.'); // Fehlermeldung im Modal-State speichern
              }
            } catch (error) {
              console.error('Password reset request failed:', error);
              setResetError('Fehler beim Anfordern des Passwort-Resets. Bitte versuchen Sie es später erneut.');
            }
          }}>
            {resetMessage && ( // Erfolgsmeldung im Modal anzeigen
              <Typography color="green" className="mb-4 text-center text-sm" placeholder="">
                {resetMessage}
              </Typography>
            )}
            <Input
              type="email"
              size="lg"
              label="E-Mail-Adresse"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="mb-4 dark:text-gray-200 dark:border-gray-500"
              placeholder=""
            />
            {resetError && ( // Fehlermeldung im Modal anzeigen
              <Typography color="red" className="mb-4 text-center text-sm" placeholder="">
                {resetError}
              </Typography>
            )}
            <div className="flex justify-end gap-2">
               <Button variant="text" color="red" onClick={() => { setIsResetModalOpen(false); setResetError(''); setResetMessage(''); setResetEmail(''); }} placeholder="">
                 Abbrechen
               </Button>
               <Button type="submit" placeholder="">
                 Link senden
               </Button>
            </div>
          </form>
        </Modal>
        {/* Erfolgsmeldung wird jetzt im Modal angezeigt, kann hier entfernt werden, wenn nicht gewünscht */}
        {/* {resetMessage && (
          <Typography color="green" className="mt-2 text-center text-sm" placeholder={undefined}>
            {resetMessage}
          </Typography>
        )} */}
      </Card>
    </div>
  )
}
