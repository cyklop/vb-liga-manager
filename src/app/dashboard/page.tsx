'use client'

import Navigation from '../../../components/Navigation';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Superadmin Dashboard</h1>
        <p>Willkommen im Dashboard. Hier können Sie eine Übersicht Ihrer Aktivitäten sehen.</p>
      </main>
    </div>
  )
}
