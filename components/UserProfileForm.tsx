import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";

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
    <Card color="transparent" shadow={false} placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
      <Typography color="gray" className="mt-1 mb-4 font-normal dark:text-gray-200">
        Geben Sie Ihre Details ein, um Ihr Profil zu aktualisieren.
      </Typography>
      <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
        <div className="mb-4 flex flex-col gap-6">
          <Input size="lg" label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}} />
          <Input size="lg" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}} />
          <Input
            type="password"
            size="lg"
            label="Neues Passwort (optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={undefined}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          />
          <Input
            type="password"
            size="lg"
            label="Passwort bestätigen"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={undefined}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          />
        </div>
        {error && (
          <Typography color="red" className="mt-2 font-normal">
            {error}
          </Typography>
        )}
        <Button className="mt-6" fullWidth type="submit" placeholder={undefined} onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
          Speichern
        </Button>
      </form>
    </Card>
  );
};

export default UserProfileForm;
