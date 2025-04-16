'use client'

'use client' // Ensure 'use client' is at the top

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
// Remove Material Tailwind imports
// import {
//   Card,
//   Input,
//   Button,
//   Typography,
// } from "@material-tailwind/react";
import { toast } from 'react-toastify'; // Import toast

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string // Token aus der URL holen

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // Remove error and success states
  // const [error, setError] = useState('')
  // const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Remove setError('') and setSuccess('')

    if (!token) {
      toast.error('Ungültiger oder fehlender Reset-Token.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Die Passwörter stimmen nicht überein.')
      return
    }

    if (password.length < 6) { // Beispiel: Mindestlänge prüfen
        toast.error('Das Passwort muss mindestens 6 Zeichen lang sein.');
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
        toast.success(data.message || 'Dein Passwort wurde erfolgreich zurückgesetzt. Du wirst weitergeleitet...')
        // Optional: Leite den Benutzer nach kurzer Verzögerung zur Login-Seite weiter
        setTimeout(() => {
          router.push('/login')
        }, 3000) // 3 Sekunden Verzögerung
      } else {
        // Use toast for API errors
        toast.error(data.message || 'Fehler beim Zurücksetzen des Passworts.')
      }
    } catch (error) {
      console.error('Password reset failed:', error)
      // Use toast for network/unexpected errors
      toast.error('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Use DaisyUI background classes
    <div className="flex min-h-screen items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
      {/* Replace Card with DaisyUI card */}
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Replace Typography with standard HTML */}
          <h2 className="card-title text-2xl justify-center">Neues Passwort festlegen</h2>
          <p className="mt-1 text-center text-base-content/70 mb-6">
            Gib dein neues Passwort ein.
          </p>
          {/* Form with DaisyUI elements */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input - Floating Label */}
            <label className="floating-label">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" " // Required for floating label animation
                required
                className="input input-bordered w-full"
                disabled={isLoading}
              />
              <span>Neues Passwort</span>
            </label>

            {/* Confirm Password Input - Floating Label */}
            <label className="floating-label">
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" " // Required for floating label animation
                required
                className="input input-bordered w-full"
                disabled={isLoading}
              />
              <span>Neues Passwort bestätigen</span>
            </label>

            {/* Remove conditional rendering for error/success messages */}

            {/* Submit Button */}
            <button
              className="btn btn-primary w-full mt-6"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner"></span> : 'Passwort zurücksetzen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
