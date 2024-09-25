'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockClosedIcon } from '@heroicons/react/20/solid'
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
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Reset error message
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (response.ok) {
        // Hier können Sie den Benutzer in den globalen Zustand setzen, z.B. mit Context API oder Redux
        console.log('Logged in user:', data)
        router.push('/dashboard')
      } else {
        setError(data.message || 'Ein Fehler ist aufgetreten')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card color="transparent" shadow={false}>
        <Typography variant="h4" color="blue-gray">
          Anmelden
        </Typography>
        <Typography color="gray" className="mt-1 font-normal">
          Geben Sie Ihre Anmeldedaten ein, um sich anzumelden.
        </Typography>
        <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
          <div className="mb-4 flex flex-col gap-6">
            <Input 
              size="lg" 
              label="E-Mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              size="lg"
              label="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center font-normal"
              >
                Angemeldet bleiben
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
          />
          {error && (
            <Typography color="red" className="mt-2 text-center text-sm">
              {error}
            </Typography>
          )}
          <Button className="mt-6" fullWidth type="submit">
            Anmelden
          </Button>
          <Typography color="gray" className="mt-4 text-center font-normal">
            Passwort vergessen?{" "}
            <a href="#" className="font-medium text-blue-500 transition-colors hover:text-blue-700">
              Zurücksetzen
            </a>
          </Typography>
        </form>
      </Card>
    </div>
  )
}
