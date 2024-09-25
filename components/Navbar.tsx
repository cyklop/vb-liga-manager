'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const pathname = usePathname()

  return (
    <nav className="bg-indigo-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Volleyball Liga
        </Link>
        <div className="space-x-4">
          <Link href="/tabelle" className={`hover:underline ${pathname === '/tabelle' ? 'font-bold' : ''}`}>
            Tabelle
          </Link>
          <Link href="/spielplan" className={`hover:underline ${pathname === '/spielplan' ? 'font-bold' : ''}`}>
            Spielplan
          </Link>
          <Link href="/dashboard" className={`hover:underline ${pathname === '/dashboard' ? 'font-bold' : ''}`}>
            Dashboard
          </Link>
          {pathname !== '/login' && (
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
