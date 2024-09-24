import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navigation = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Hier würde normalerweise die Logout-Logik implementiert werden
    // z.B. Löschen des Auth-Tokens, Zurücksetzen des Zustands, etc.
    console.log('Logout durchgeführt');
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li><Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link></li>
        <li><Link href="/teams" className="hover:text-gray-300">Mannschaften</Link></li>
        <li><Link href="/users" className="hover:text-gray-300">Benutzer</Link></li>
        <li><Link href="/account" className="hover:text-gray-300">Kontoeinstellungen</Link></li>
        <li><button onClick={handleLogout} className="hover:text-gray-300">Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navigation;
