'use client'

import { useEffect, useState } from 'react' // Fragment, Disclosure, Menu, Transition removed
import { Bars3Icon, ArrowRightStartOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline' // Adjusted icons, removed XMarkIcon
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
// Importiere den zentralen User-Typ
import type { UserProfile } from '@/types/models';

// Lokales User Interface entfernt

const navigation = [
  { name: 'Tabelle', href: '/table' },
  { name: 'Spielplan', href: '/fixtures' },
]

const adminNavigation = [
  { name: 'Mannschaften', href: '/admin/teams' },
  { name: 'Benutzer', href: '/admin/users' },
  { name: 'Ligen', href: '/admin/leagues' },
]

// Navigation für Teamleiter (normale Benutzer mit Teamleiter-Rolle)
const teamLeaderNavigation = [
  { name: 'Meine Mannschaft', href: '/team' }, // Corrected href for team page
]

// Keep classNames for now, might be needed for admin dropdown active state
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  // Verwende den importierten Typ
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const user = await response.json()
        setCurrentUser(user)
      } else {
        console.error('Fehler beim Abrufen des Benutzers:', response.statusText)
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzers:', error)
    }
  }

  const handleLogout = async () => {
    try {
      // 1. Rufe unsere benutzerdefinierte Route auf, um Cookies serverseitig sicher zu löschen
      const response = await fetch('/api/auth/custom-signout', {
        method: 'POST',
      });

      if (response.ok) {
        console.log('Custom signout API call successful.');

        // 2. Rufe signOut von next-auth auf, um den Client-Status zu bereinigen,
        //    aber verhindere die automatische Weiterleitung durch next-auth.
        await signOut({ redirect: false }); 
        console.log('next-auth signOut({ redirect: false }) called.');

        // 3. Setze den lokalen Benutzerstatus zurück
        setCurrentUser(null);

        // 4. Führe einen harten Redirect zur Login-Seite durch.
        console.log('Redirecting to /login via window.location.href');
        window.location.href = '/login';

      } else {
        console.error('Custom signout API call failed:', await response.text());
        // Optional: Fehlermeldung anzeigen
        alert('Logout fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      console.error('Error during custom logout request:', error);
      alert('Ein Fehler ist beim Logout aufgetreten.');
    }
  }

  // Determine active state for menu items
  const isActive = (href: string) => pathname === href;
  const isAdminActive = (href: string) => pathname.startsWith('/admin') && href === '/admin'; // Special case for top-level admin

  return (
    <div className="navbar bg-primary text-primary-content shadow-md"> {/* Use DaisyUI navbar classes */}
      <div className="navbar-start">
        {/* Mobile Menu Dropdown */}
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden"> {/* Use label for dropdown trigger */}
            <Bars3Icon className="h-6 w-6" />
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className={isActive(item.href) ? 'active' : ''}>
                  {item.name}
                </Link>
              </li>
            ))}
            {currentUser?.team && (
              <li>
                <Link href="/team" className={isActive('/team') ? 'active' : ''}>
                  Meine Mannschaft
                </Link>
              </li>
            )}
            {(currentUser?.isAdmin || currentUser?.isSuperAdmin) && (
              <>
                <li><hr className="my-2 border-base-300" /></li> {/* Divider */}
                <li>
                  <Link href="/admin" className={isAdminActive('/admin') ? 'active' : ''}>
                    Admin Übersicht
                  </Link>
                </li>
                {adminNavigation.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className={isActive(item.href) ? 'active' : ''}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
        {/* Brand/Logo */}
        <Link href="/dashboard" className="btn btn-ghost text-xl normal-case"> {/* Use btn-ghost for clickable area */}
          Volleyball Liga
        </Link>
      </div>

      {/* Desktop Menu Center */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1"> {/* Keep px-1 for overall padding */}
          {navigation.map((item) => (
            <li key={item.name} className="mx-4"> {/* Add horizontal margin to list items */}
              <Link href={item.href} className={isActive(item.href) ? 'active' : ''}>
                {item.name}
              </Link>
            </li>
          ))}
          {currentUser?.team && (
            <li className="mx-4"> {/* Add horizontal margin */}
              <Link href="/team" className={isActive('/team') ? 'active' : ''}>
                Meine Mannschaft
              </Link>
            </li>
          )}
          {/* Admin Collapsible Submenu Desktop */}
          {(currentUser?.isAdmin || currentUser?.isSuperAdmin) && (
            <li className="mx-4"> {/* Add horizontal margin */}
              <details> {/* Use details for collapsible menu */}
                <summary className={classNames(
                    pathname.startsWith('/admin') ? 'active' : '', // Apply active style to the summary if in admin section
                    'group-hover:block' // Add any other necessary classes for summary styling if needed
                  )}>
                  Admin
                  {/* DaisyUI Menu automatically adds arrow to summary inside details */}
                </summary>
                <ul className="p-2 bg-base-100 group rounded-t-none z-[1] text-base-content shadow -mt-1!"> {/* Style the submenu */}
                  <li> {/* Add link to main admin page */}
                    <Link href="/admin" className={isAdminActive('/admin') ? 'active' : ''}>
                      Übersicht
                    </Link>
                  </li>
                  {adminNavigation.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className={isActive(item.href) ? 'active' : ''}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          )}
        </ul>
      </div>

      {/* User Actions End */}
      <div className="navbar-end">
        {currentUser ? (
          <>
            {/* Account Button */}
            <Link href="/account" className="btn btn-ghost btn-square" title="Konto"> {/* Added title attribute */}
              <Cog6ToothIcon className="h-5 w-5" />
            </Link>
            {/* Logout Button */}
            <button onClick={handleLogout} className="btn btn-ghost ml-1" title="Logout"> {/* Added title attribute */}
              <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-outline btn-sm border-primary-content text-primary-content hover:bg-primary-content hover:text-primary"> {/* Adjusted login button style */}
            Login
          </Link>
        )}
      </div>
    </div>
  )
}
