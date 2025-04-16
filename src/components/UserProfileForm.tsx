import React, { useState } from 'react'; // Material Tailwind & Headless UI Imports entfernt

interface User {
  id: number;
  email: string;
  name: string;
  password?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  team?: {
    id: number;
    name: string;
  };
}

interface UserProfileFormProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
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

    const updatedUser: Partial<User> = { name, email };
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
        {/* Gap reduziert für DaisyUI form-control */}
        <div className="mb-4 flex flex-col gap-4">

          {/* Name Input */}
          <div className="form-control w-full">
            <label className="label" htmlFor="name">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full" // DaisyUI Input Klassen
            />
          </div>

          {/* Email Input */}
          <div className="form-control w-full">
            <label className="label" htmlFor="email">
              <span className="label-text">E-Mail</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full" // DaisyUI Input Klassen
            />
          </div>

          {/* Password Input */}
          <div className="form-control w-full">
            <label className="label" htmlFor="password">
              <span className="label-text">Neues Passwort (optional)</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full" // DaisyUI Input Klassen
            />
          </div>

          {/* Confirm Password Input */}
          <div className="form-control w-full">
            <label className="label" htmlFor="confirmPassword">
              <span className="label-text">Passwort bestätigen</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input input-bordered w-full" // DaisyUI Input Klassen
            />
          </div>

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
