'use client'

import { Fragment, useEffect, useState } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation' // useRouter wieder hinzugefügt
import { signOut } from 'next-auth/react'; // signOut importieren

interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
  isSuperAdmin: boolean
  team?: { // Add optional team property
    id: number;
    name: string;
  } | null;
}

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
  { name: 'Meine Mannschaft', href: '/admin/teams' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    fetchCurrentUser()
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

  return (
    <Disclosure as="nav" className="bg-indigo-600">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-indigo-200 hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center sm:items-stretch sm:justify-start"> {/* justify-center entfernt */}
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/dashboard" className="text-2xl font-bold text-white">
                    Volleyball Liga
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          pathname === item.href
                            ? 'bg-indigo-700 text-white'
                            : 'text-indigo-200 hover:bg-indigo-500 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                    
                    {/* Zeige Teamleiter-Link für alle Benutzer mit Team */}
                    {currentUser?.team && (
                      <Link
                        href="/team"
                        className={classNames(
                          pathname === '/team'
                            ? 'bg-indigo-700 text-white'
                            : 'text-indigo-200 hover:bg-indigo-500 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                      >
                        Meine Mannschaft
                      </Link>
                    )}
                    
                    {/* Admin-Menü nur für Administratoren anzeigen */}
                    {(currentUser?.isAdmin || currentUser?.isSuperAdmin) && (
                      <div className="relative group hover:cursor-pointer">
                        <Link
                          href="/admin"
                          className={classNames(
                            pathname === '/admin' || pathname.startsWith('/admin/')
                              ? 'bg-indigo-700 text-white'
                              : 'text-indigo-200 hover:bg-indigo-500 hover:text-white',
                            'rounded-md px-3 py-2 text-sm font-medium inline-flex items-center'
                          )}
                        >
                          Admin
                          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                          </svg>
                        </Link>
                        <div className="absolute right-0 z-10 mt-0 w-48 origin-top-right rounded-md bg-white dark:bg-card py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                          {adminNavigation.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={classNames(
                                pathname === item.href 
                                  ? 'bg-gray-100 text-gray-900 dark:bg-muted dark:text-foreground' 
                                  : 'text-gray-700 hover:bg-gray-100 dark:text-foreground dark:hover:bg-muted',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {currentUser ? (
                  <>
                    <Link
                      href="/account"
                      className="rounded-md bg-indigo-500 p-2 text-sm font-medium text-white hover:bg-indigo-400 mr-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="rounded-md bg-indigo-500 p-2 text-sm font-medium text-white hover:bg-indigo-400"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    pathname === item.href
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-200 hover:bg-indigo-500 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {/* Zeige Teamleiter-Link für alle Benutzer mit Team im mobilen Menü */}
              {currentUser?.team && (
                <Disclosure.Button
                  as="a"
                  href="/team"
                  className={classNames(
                    pathname === '/team'
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-200 hover:bg-indigo-500 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                >
                  Meine Mannschaft
                </Disclosure.Button>
              )}
              
              {/* Admin-Menü und Untermenüs für mobile Ansicht */}
              {(currentUser?.isAdmin || currentUser?.isSuperAdmin) && (
                <>
                  <Disclosure.Button
                    as="a"
                    href="/admin"
                    className={classNames(
                      pathname === '/admin'
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-200 hover:bg-indigo-500 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                  >
                    Admin
                  </Disclosure.Button>
                  
                  {adminNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        pathname === item.href
                          ? 'bg-indigo-700 text-white'
                          : 'text-indigo-200 hover:bg-indigo-500 hover:text-white',
                        'block rounded-md px-3 py-2 text-base font-medium pl-6'
                      )}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
