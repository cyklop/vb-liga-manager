'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LockClosedIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import Modal from '../../../components/Modal'
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
  const [error, setError] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Reset error message
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      if (result?.error) {
        setError(result.error || 'Anmeldung fehlgeschlagen')
      } else {
        router.replace('/dashboard')
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card color="transparent" shadow={false} placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
        <Typography variant="h4" color="blue-gray" placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
          Anmelden
        </Typography>
        <Typography color="gray" className="mt-1 font-normal" placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
          Geben Sie Ihre Anmeldedaten ein, um sich anzumelden.
        </Typography>
        <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
          <div className="mb-4 flex flex-col gap-6">
            <Input 
              size="lg" 
              label="E-Mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={undefined}
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
              crossOrigin={undefined}
            />
            <Input
              type="password"
              size="lg"
              label="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={undefined}
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
              crossOrigin={undefined}
            />
          </div>
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center font-normal"
                placeholder={undefined}
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
              >
                Angemeldet bleiben
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
            placeholder={undefined}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            crossOrigin={undefined}
          />
          {error && (
            <Typography color="red" className="mt-2 text-center text-sm" placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
              {error}
            </Typography>
          )}
          <Button className="mt-6" fullWidth type="submit" placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
            Anmelden
          </Button>
          <Typography color="gray" className="mt-4 text-center font-normal" placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
            Passwort vergessen?{" "}
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="font-medium text-blue-500 transition-colors hover:text-blue-700"
            >
              Zurücksetzen
            </button>
          </Typography>
        </form>
        <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Passwort zurücksetzen">
          <form onSubmit={async (e) => {
            e.preventDefault()
            try {
              const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail }),
              })
              const data = await response.json()
              if (response.ok) {
                setResetMessage(data.message)
                setIsResetModalOpen(false)
              } else {
                setError(data.message)
              }
            } catch (error) {
              setError('Fehler beim Zurücksetzen des Passworts')
            }
          }}>
            <Input
              type="email"
              size="lg"
              label="E-Mail-Adresse"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder={undefined}
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
              crossOrigin={undefined}
              className="mb-4"
            />
            <Button type="submit" fullWidth placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
              Passwort zurücksetzen
            </Button>
          </form>
        </Modal>
        {resetMessage && (
          <Typography color="green" className="mt-2 text-center text-sm" placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
            {resetMessage}
          </Typography>
        )}
      </Card>
    </div>
  )
}
