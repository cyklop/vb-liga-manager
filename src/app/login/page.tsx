'use client'

import { useState, useEffect, useCallback } from 'react' // Import useCallback
import { useRouter } from 'next/navigation'
import { LockClosedIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import Modal from '@/components/Modal'
import { signIn } from 'next-auth/react'
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { Engine } from "@tsparticles/engine"
import { loadFull } from "tsparticles" 
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
  const [init, setInit] = useState(false); // State für Partikel-Initialisierung

  // Partikel-Engine initialisieren
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      await loadFull(engine);
      //await loadSlim(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);
  const particlesLoaded = useCallback(async (container: any) => {
    // Optional: Aktionen nach dem Laden der Partikel
    // console.log(container);
  }, []);

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

  // Partikel Konfiguration (angepasst)
  const particleOptions = {
    fpsLimit: 60,
    particles: {
      number: {
        value: 60, // Anzahl der Partikel
        density: {
          enable: true,
          value_area: 800 // Bereich, in dem die Dichte wirkt
        }
      },
      color: {
        // Farben an das Theme anpassen (Beispiel: Indigo/Blau und Weiß/Grau)
        value: ["#35b5ff", "#4abfff", "#ffffff", "#0063a6"]
      },
      shape: {
        type: "circle", // Einfachere Form, oft performanter
      },
      opacity: {
        value: 0.4, // Etwas transparenter
        random: true, // Zufällige Opazität
      },
      size: {
        value: 3, // Kleinere Partikel
        random: true,
      },
      links: { // 'line_linked' heißt jetzt 'links'
        enable: true,
        distance: 120, // Etwas größere Distanz für Linien
        color: "#a5b4fc", // Linienfarbe (helles Indigo)
        opacity: 0.3,
        width: 1
      },
      move: {
        enable: true,
        speed: 2, // Langsamere Geschwindigkeit
        direction: "none",
        random: true, // Zufällige Richtung
        straight: false,
        outModes: { // 'out_mode' heißt jetzt 'outModes'
            default: "out",
        },
        bounce: false,
      }
    },
    interactivity: { // Interaktivität hinzufügen (optional)
      events: {        
        onClick: {
          enable: true,
          mode: "push", // Partikel hinzufügen bei Klick
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
        push: {
          quantity: 4,
        },
      },
    },
    detectRetina: true, // 'retina_detect' heißt jetzt 'detectRetina'
    background: { // Hintergrund der Partikel-Canvas (transparent)
        color: '#0082ce',
    }
  };


  return (
    // Hintergrundfarben beibehalten, overflow-hidden hinzufügen
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
       {/* Particles Komponente */}
       {init && (
         <Particles
           id="tsparticles"
           particlesLoaded={particlesLoaded}
           options={particleOptions as any} // 'as any' um Type-Checking zu umgehen, falls Optionen nicht 100% übereinstimmen
           className="absolute top-0 left-0 w-full h-full z-0" // Positionierung im Hintergrund
         />
       )}

      <Card shadow={false} className="bg-base-100 p-6 relative z-10 rounded-lg" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <Typography variant="h4" color="blue-gray" className='text-base-content' placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          Anmelden
        </Typography>
        <Typography color="gray" className="mt-1 font-normal text-base-content/70" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          Geben Sie Ihre Anmeldedaten ein, um sich anzumelden.
        </Typography>
        <form onSubmit={handleSubmit} className="mt-8 mb-2">
          <div className="mb-4 flex flex-col gap-6">
            <label htmlFor="email" className='floating-label text-base-content'>
              <span>E-Mail</span>
              <Input 
                size="lg"
                value={email}
                className='input'
                onChange={(e) => setEmail(e.target.value)}
                placeholder={undefined}
                crossOrigin={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              />
            </label>

            <label htmlFor="password" className='floating-label text-base-content'>
              <span>Passwort</span>
              <Input
                type="password"
                size="lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={undefined}
                crossOrigin={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              />
            </label>           
            
          </div>
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="text-base-content font-normal fieldset-label"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                Angemeldet bleiben
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
            className="checkbox checkbox-primary "
            placeholder={undefined}
            id='cookie'
            iconProps={{
              className: ""
            }}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            crossOrigin={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          />
          {error && (
            <Typography color="red" className="mt-2 text-center text-sm" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
              {error}
            </Typography>
          )}
          <Button className="mt-6 bg-primary btn btn-primary" fullWidth type="submit" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            Anmelden
          </Button>
          <Typography color="gray" className="mt-4 text-center text-base-content font-normal" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            Passwort vergessen?{" "}
            <button
              type="button" // Verhindert das Absenden des Formulars
              onClick={() => setIsResetModalOpen(true)}
              className="font-medium link link-primary"
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
              <Typography color="green" className="mb-4 text-center text-sm" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                {resetMessage}
              </Typography>
            )}
            
            <label htmlFor="password" className='floating-label'>
              <span>E-Mail-Adresse</span>
              <Input
              type="email"
              size="lg"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="mb-4 mt-2 input"
              placeholder={undefined}
              crossOrigin={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
            </label>   
            
            {resetError && ( // Fehlermeldung im Modal anzeigen
              <Typography color="red" className="mb-4 text-center text-sm" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                {resetError}
              </Typography>
            )}
            <div className="flex justify-end gap-2">
               <Button variant="text" className='btn' onClick={() => { setIsResetModalOpen(false); setResetError(''); setResetMessage(''); setResetEmail(''); }} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                 Abbrechen
               </Button>
               <Button type="submit" className='btn btn-primary' placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                 Link senden
               </Button>
            </div>
          </form>
        </Modal>        
      </Card>
    </div>
  )
}
