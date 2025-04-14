'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string // Token aus der URL holen

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Ungültiger oder fehlender Reset-Token.')
      return
    }

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    if (password.length < 6) { // Beispiel: Mindestlänge prüfen
        setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
        return;
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.')
        // Optional: Leite den Benutzer nach kurzer Verzögerung zur Login-Seite weiter
        setTimeout(() => {
          router.push('/login')
        }, 3000) // 3 Sekunden Verzögerung
      } else {
        setError(data.message || 'Fehler beim Zurücksetzen des Passworts.')
      }
    } catch (error) {
      console.error('Password reset failed:', error)
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card color="transparent" shadow={false} placeholder={undefined} className="dark:bg-gray-800/30 p-6" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <Typography variant="h4" color="blue-gray" placeholder={undefined} className="dark:text-gray-100" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          Neues Passwort festlegen
        </Typography>
        <Typography color="gray" className="mt-1 font-normal dark:text-gray-300" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} >
          Gib dein neues Passwort ein.
        </Typography>
        <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-(--breakpoint-lg) sm:w-96">
          {!success ? (
            <>
              <div className="mb-4 flex flex-col gap-6">
                <Input
                  type="password"
                  size="lg"
                  label="Neues Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={undefined}
                  crossOrigin={undefined}
                  className="dark:text-gray-200 dark:border-gray-500"
                  disabled={isLoading}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                />
                <Input
                  type="password"
                  size="lg"
                  label="Neues Passwort bestätigen"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={undefined}
                  crossOrigin={undefined}
                  className="dark:text-gray-200 dark:border-gray-500"
                  disabled={isLoading}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                />
              </div>
              {error && (
                <Typography color="red" className="mt-2 text-center text-sm" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                  {error}
                </Typography>
              )}
              <Button className="mt-6" fullWidth type="submit" placeholder={undefined} disabled={isLoading} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                {isLoading ? 'Wird verarbeitet...' : 'Passwort zurücksetzen'}
              </Button>
            </>
          ) : (
            <Typography color="green" className="mt-4 text-center text-sm" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
              {success}
            </Typography>
          )}
        </form>
      </Card>
    </div>
  )
}
