import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Label } from '@headlessui/react';

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
    <Card color="transparent" shadow={false} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
      <Typography variant="h4" color="blue-gray" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        Profil aktualisieren
      </Typography>
      <Typography color="gray" className="mt-1 mb-4 font-normal" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        Geben Sie Ihre Details ein, um Ihr Profil zu aktualisieren.
      </Typography>
      <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-(--breakpoint-lg) sm:w-lg">
        <div className="mb-4 flex flex-col gap-6">
          <label htmlFor="Name" className='floating-label'>
            <span>Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={undefined} className='input' crossOrigin={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
          </label>
          
          <label htmlFor="Email" className='floating-label'>
            <span>E-Mail</span>
            <Input size="lg" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={undefined} className="input"  crossOrigin={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
          </label>
          
          <label htmlFor="password" className='floating-label'>
            <span>Neues Passwort (optional)</span>
            <Input
            type="password"
            size="lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={undefined}
            className="input"
            crossOrigin={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          />
          </label>

          <label htmlFor="password" className='floating-label'>
            <span>Passwort bestätigen</span>
            <Input
            type="password"
            size="lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={undefined}
            className="input"
            crossOrigin={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          />
          </label>
          
          
        </div>
        {error && (
          <Typography color="red" className="mt-2 font-normal" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            {error}
          </Typography>
        )}
        <Button className="mt-6 btn btn-primary" fullWidth type="submit" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          Profil aktualisieren
        </Button>
      </form>
    </Card>
  );
};

export default UserProfileForm;
