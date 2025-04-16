'use client'

import { useState, useEffect, useCallback } from 'react' // Import useCallback
import { useRouter } from 'next/navigation'
// Remove LockClosedIcon if not used elsewhere
// import { LockClosedIcon } from '@heroicons/react/20/solid'
// Keep Link if needed, otherwise remove (assuming it's used for forgot password or similar)
import Link from 'next/link' 
import Modal from '@/components/Modal'
import { signIn } from 'next-auth/react'
import Particles, { initParticlesEngine } from "@tsparticles/react";
// Remove Engine if not directly used
// import { Engine } from "@tsparticles/engine"
import { loadFull } from "tsparticles" 
// Remove Material Tailwind imports
// import {
//   Card,
//   Input,
//   Checkbox,
//   Button,
//   Typography,
// } from "@material-tailwind/react";

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

      {/* Replace Card with div and DaisyUI card classes */}
      <div className="card bg-base-100 shadow-xl p-6 relative z-10 w-full max-w-md"> {/* Added max-w-md for sizing */}
        {/* Replace Typography with standard HTML */}
        <h2 className="text-2xl font-semibold text-center text-base-content mb-2">
          Anmelden
        </h2>
        <p className="mt-1 text-center font-normal text-base-content/70 mb-6">
          Geben Sie Ihre Anmeldedaten ein, um sich anzumelden.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6"> {/* Use space-y for gap */}
          {/* Email Input with DaisyUI form-control */}
          <div className="form-control">
            <label className="floating-label" htmlFor="email">
              <span className="label-text">E-Mail</span>
              <input
              id="email"
              type="email"
              required // Add required attribute for basic validation
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full" // DaisyUI input classes
              placeholder="ihre@email.de" // Add placeholder
            />
            </label>
            
          </div>

          {/* Password Input with DaisyUI form-control */}
          <div className="form-control">
             <label className="floating-label" htmlFor="password">
               <span className="label-text">Passwort</span>
               <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full" // DaisyUI input classes
                  placeholder="********" // Add placeholder
                />
             </label>
            
          </div>           
            
          {/* Remember Me Checkbox with DaisyUI form-control */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                id="rememberMe" // Changed id to rememberMe for clarity
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox checkbox-primary" // DaisyUI checkbox classes
              />
              <span className="label-text">Angemeldet bleiben</span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <p className="mt-2 text-center text-sm text-error"> {/* Use text-error for DaisyUI error color */}
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button className="btn btn-primary w-full mt-6" type="submit"> {/* DaisyUI button */}
            Anmelden
          </button>

          {/* Forgot Password Link */}
          <p className="mt-4 text-center text-base-content font-normal">
            Passwort vergessen?{" "}
            <button
              type="button" // Keep type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="link link-primary font-medium" // DaisyUI link classes
            >
              Zurücksetzen
            </button>
          </p>
        </form>

        {/* Modal Usage (props remain the same, component internally uses DaisyUI now) */}
        <Modal isOpen={isResetModalOpen} onClose={() => { setIsResetModalOpen(false); setResetError(''); setResetMessage(''); setResetEmail(''); }} title="Passwort zurücksetzen">
          <form onSubmit={async (e) => {
            e.preventDefault();
            setResetError(''); // Reset error
            setResetMessage(''); // Reset success message
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
            {/* Success Message */}
            {resetMessage && (
              <div role="alert" className="alert alert-success mb-4"> {/* DaisyUI alert */}
                 <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <span>{resetMessage}</span>
              </div>
            )}
            
            {/* Email Input inside Modal */}
            <div className="form-control mb-4">
              <label className="label" htmlFor="reset-email">
                <span className="label-text">E-Mail-Adresse</span>
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="input input-bordered w-full" // DaisyUI input
                placeholder="ihre@email.de"
              />
            </div>   
            
            {/* Error Message inside Modal */}
            {resetError && (
               <div role="alert" className="alert alert-error mb-4"> {/* DaisyUI alert */}
                 <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <span>{resetError}</span>
               </div>
            )}

            {/* Modal Action Buttons */}
            <div className="modal-action mt-4"> {/* Use modal-action for standard button placement */}
               {/* Cancel Button */}
               <button
                 type="button" // Important: type="button" to prevent form submission
                 className='btn btn-ghost' // DaisyUI button style
                 onClick={() => { setIsResetModalOpen(false); setResetError(''); setResetMessage(''); setResetEmail(''); }}>
                 Abbrechen
               </button>
               {/* Submit Button */}
               <button type="submit" className='btn btn-primary'> {/* DaisyUI button style */}
                 Link senden
               </button>
            </div>
          </form>
        </Modal>        
      </div> {/* Close the main card div */}
    </div>
  )
}
