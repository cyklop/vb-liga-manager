import { useState } from 'react'
import Layout from '../components/Layout'

export default function Dashboard() {
  const [teams, setTeams] = useState<string[]>([])
  const [newTeam, setNewTeam] = useState('')
  const [newAdmin, setNewAdmin] = useState('')

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTeam) {
      setTeams([...teams, newTeam])
      setNewTeam('')
    }
  }

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    // Hier würde man normalerweise eine API-Anfrage senden, um den Admin hinzuzufügen
    console.log(`Neuer Admin hinzugefügt: ${newAdmin}`)
    setNewAdmin('')
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Superadmin Dashboard</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Mannschaften hinzufügen</h2>
          <form onSubmit={handleAddTeam} className="flex gap-2">
            <input
              type="text"
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
              placeholder="Neue Mannschaft"
              className="flex-grow px-3 py-2 border rounded"
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Hinzufügen
            </button>
          </form>
          <ul className="mt-4 list-disc list-inside">
            {teams.map((team, index) => (
              <li key={index}>{team}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Admin hinzufügen</h2>
          <form onSubmit={handleAddAdmin} className="flex gap-2">
            <input
              type="text"
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
              placeholder="Neuer Admin"
              className="flex-grow px-3 py-2 border rounded"
            />
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
              Admin hinzufügen
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
