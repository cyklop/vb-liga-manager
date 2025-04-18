import React, { useState } from 'react';
// Importiere den zentralen User-Typ
import type { UserProfile } from '@/types/models';

// Lokales User Interface entfernt

interface UserProfileFormProps {
  // Verwende den importierten Typ
  user: UserProfile;
  // Verwende Partial<UserProfile>
  onUpdate: (updatedUser: Partial<UserProfile & { password?: string }>) => void; // Füge password explizit hinzu
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name ?? ''); // Default zu leerem String, falls name null/undefined ist
  const [email, setEmail] = useState(user.email ?? ''); // Default zu leerem String
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password && password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    // Typ für updatedUser anpassen
    const updatedUser: Partial<UserProfile & { password?: string }> = { name, email };
    if (password) {
      updatedUser.password = password;
    }

    onUpdate(updatedUser);
  };

  return (
    // Card durch div ersetzt, Styling kommt von der übergeordneten Seite oder kann hier hinzugefügt werden
    <div>
      {/* Typography durch h2 ersetzt */}
      <h2 className="text-2xl font-bold text-base-content">
        Profil aktualisieren
      </h2>
      {/* Typography durch p ersetzt */}
      <p className="mt-1 mb-4 text-base-content/70">
        Geben Sie Ihre Details ein, um Ihr Profil zu aktualisieren.
      </p>
      {/* Klassen für Breite und max-width angepasst */}
      <form onSubmit={handleSubmit} className="mt-8 mb-2 w-full max-w-md">
        {/* Gap erhöht für Floating Labels */}
        <div className="mb-4 flex flex-col gap-6">

          {/* Name Input - Floating Label */}
          <label className="floating-label w-full">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full" // DaisyUI Input Klassen
              placeholder="Name" // Placeholder für Floating Label
            />
            <span>Name</span>
          </label>

          {/* Email Input - Floating Label */}
          <label className="floating-label w-full">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full" // DaisyUI Input Klassen
              placeholder="E-Mail" // Placeholder für Floating Label
            />
            <span>E-Mail</span>
          </label>

          {/* Password Input - Floating Label */}
          <label className="floating-label w-full">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full" // DaisyUI Input Klassen
              placeholder="Neues Passwort (optional)" // Placeholder für Floating Label
            />
            <span>Neues Passwort (optional)</span>
          </label>

          {/* Confirm Password Input - Floating Label */}
          <label className="floating-label w-full">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input input-bordered w-full" // DaisyUI Input Klassen
              placeholder="Passwort bestätigen" // Placeholder für Floating Label
            />
            <span>Passwort bestätigen</span>
          </label>

        </div>
        {error && (
          // Typography durch p mit Fehlerfarbe ersetzt
          <p className="mt-2 text-error text-sm">
            {error}
          </p>
        )}
        {/* Button durch button mit DaisyUI Klassen ersetzt */}
        <button className="btn btn-primary mt-6 w-full" type="submit">
          Profil aktualisieren
        </button>
      </form>
    </div>
  );
};

export default UserProfileForm;
// Entferne den duplizierten Code-Block von hier bis zum Dateiende
