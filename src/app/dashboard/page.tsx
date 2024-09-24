'use client'

import Navigation from '../../../components/Navigation'

export default function Dashboard() {
  return (
    <>
      <Navigation />
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Superadmin Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="h-96 rounded-lg border-4 border-dashed border-gray-200">
              <p className="text-center mt-8">Willkommen im Dashboard. Hier können Sie eine Übersicht Ihrer Aktivitäten sehen.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
