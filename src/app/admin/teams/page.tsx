'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // Import useRouter
import Navigation from '@/components/Navbar'
import Modal from '@/components/Modal'
import DeleteConfirmation from '@/components/DeleteConfirmation' // Import hinzufügen
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify';

interface User {
  id: number
  name: string
  isAdmin?: boolean
  isSuperAdmin?: boolean
  team?: {
    id: number
    name: string
  }
}

interface Team {
  id: number
  name: string
  location: string
  hallAddress: string
  trainingTimes: string
  teamLeader?: User
}

export default function TeamsPage() {
  const router = useRouter() // Initialize router
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Use a separate state for form data, including teamLeaderId
  interface TeamFormData {
    id?: number;
    name?: string;
    location?: string;
    hallAddress?: string;
    trainingTimes?: string;
    teamLeaderId?: string; // Use string for select compatibility
  }
  const [formData, setFormData] = useState<TeamFormData>({})
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  // State für Löschbestätigung hinzufügen
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)

  // Removed currentUser, isAdmin, userTeamId states

  useEffect(() => {
    // Removed init function and fetchCurrentUser call
    fetchTeams()
    fetchUsers()
  }, [])

  // Removed fetchCurrentUser function

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        // Always show all teams now, as only admins access this page
        setTeams(data)
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Teams', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzer', error)
    }
  }

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send data from formData, converting teamLeaderId to number
        body: JSON.stringify({
          ...formData,
          teamLeaderId: formData.teamLeaderId ? parseInt(formData.teamLeaderId) : null
        }),
      })
      if (response.ok) {
        setFormData({}) // Reset form data state
        setIsModalOpen(false)
        fetchTeams()
        toast.success('Mannschaft erfolgreich hinzugefügt!');
      } else {
        const errorData = await response.json();
        toast.error(`Fehler: ${errorData.message || 'Mannschaft konnte nicht hinzugefügt werden.'}`);
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Teams', error)
      toast.error('Ein Netzwerk- oder Serverfehler ist aufgetreten.');
    }
  }

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeam) return

    try {
      const response = await fetch(`/api/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Send data from formData, converting teamLeaderId to number
        body: JSON.stringify({
          ...formData,
          teamLeaderId: formData.teamLeaderId ? parseInt(formData.teamLeaderId) : null
        }),
      })
      if (response.ok) {
        setFormData({}) // Reset form data state
        setIsModalOpen(false)
        setEditingTeam(null)
        fetchTeams()
        toast.success('Mannschaft erfolgreich aktualisiert!');
      } else {
        const errorData = await response.json();
        toast.error(`Fehler: ${errorData.message || 'Mannschaft konnte nicht aktualisiert werden.'}`);
      }
    } catch (error) {
      console.error('Fehler beim Bearbeiten des Teams', error)
      toast.error('Ein Netzwerk- oder Serverfehler ist aufgetreten.');
    }
  }

  // Funktion, um den Löschdialog zu öffnen
  const requestDeleteTeam = (team: Team) => {
    setTeamToDelete(team)
    setShowDeleteConfirmation(true)
  }

  // Funktion, die die Löschung nach Bestätigung durchführt
  const confirmDeleteTeam = async () => {
    if (teamToDelete) {
      try {
        const response = await fetch(`/api/teams/${teamToDelete.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchTeams() // Liste nach erfolgreichem Löschen neu laden
          toast.success(`Mannschaft '${teamToDelete.name}' erfolgreich gelöscht!`);
        } else {
          const errorText = await response.text();
          console.error('Fehler beim Löschen des Teams:', errorText)
          toast.error(`Fehler: ${errorText || 'Mannschaft konnte nicht gelöscht werden.'}`);
        }
      } catch (error) {
        console.error('Fehler beim Löschen des Teams', error)
        toast.error('Ein Netzwerk- oder Serverfehler ist aufgetreten.');
      } finally {
        // Dialog schließen und State zurücksetzen
        setShowDeleteConfirmation(false)
        setTeamToDelete(null)
      }
    }
  }

  // Funktion zum Abbrechen des Löschvorgangs
  const cancelDeleteTeam = () => {
    setShowDeleteConfirmation(false)
    setTeamToDelete(null)
  }


  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Title is always "Mannschaften verwalten" */}
        <h1 className="text-2xl font-bold mb-4">
          Mannschaften verwalten
        </h1>
        {/* Add Team Button - Always shown */}
        <button
          onClick={() => {
            setEditingTeam(null)
              setFormData({}) // Reset form data for adding new team
              setIsModalOpen(true)
            }}
            className="btn btn-primary"
          >
           Neue Mannschaft hinzufügen
         </button>
       {/* Use DaisyUI card styling for the list container */}
       <div className="card bg-base-100 shadow-xl mt-4">
         <div className="card-body p-0"> {/* Remove padding if list items have padding */}
           <ul className="divide-y divide-base-300"> {/* Use DaisyUI divider */}
         {teams.map((team) => (
           <li key={team.id} className="hover:bg-base-200 transition-colors duration-150"> {/* Add hover effect */}
             <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
               <div>
                 <p className="text-md font-medium truncate">{team.name}</p> {/* Slightly larger text */}
                 <p className="text-sm text-base-content/70">{team.location}</p> {/* Adjusted text color */}
                 <p className="text-sm text-base-content/70">{team.hallAddress}</p> {/* Adjusted text color */}
                 {team.trainingTimes && <p className="text-xs text-base-content/70 mt-1">Trainingszeiten: {team.trainingTimes}</p>} {/* Smaller text */}
                 {team.teamLeader && <p className="text-xs text-base-content/70 mt-1">Spielleiter: {team.teamLeader.name}</p>} {/* Smaller text */}
               </div>
               <div className="flex items-center space-x-2"> {/* Add space between buttons */}
                 {/* Tooltip Wrapper */}
                 <div className="tooltip" data-tip="Mannschaft bearbeiten">
                   <button
                     onClick={() => {
                       setEditingTeam(team)
                       // Populate formData from the selected team for editing
                       setFormData({
                         id: team.id,
                         name: team.name || '',
                         location: team.location || '',
                         hallAddress: team.hallAddress || '',
                         trainingTimes: team.trainingTimes || '',
                         teamLeaderId: team.teamLeader?.id?.toString() || '' // Set teamLeaderId as string
                       })
                       setIsModalOpen(false) // Close modal first if already open from another edit
                       setTimeout(() => setIsModalOpen(true), 0) // Then open with new data
                     }}
                     className="p-1 btn btn-sm btn-soft btn-secondary" // Reverted to btn-soft
                     // title removed
                   >
                     <PencilIcon className="h-5 w-5" />
                 </button>
               </div>
               {/* Tooltip Wrapper */}
               <div className="tooltip" data-tip="Mannschaft löschen">
                 <button
                   onClick={() => requestDeleteTeam(team)}
                     className="p-1 btn btn-sm btn-soft btn-error" // Reverted to btn-soft
                     // title removed
                   >
                     <TrashIcon className="h-5 w-5" />
                   </button>
               </div>
             </div>
             </div>
           </li>
         ))}
       </ul>
         </div> {/* Close card-body */}
       </div> {/* Close card */}
     </div>
     <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setFormData({}); setEditingTeam(null); }} title={editingTeam ? "Mannschaft bearbeiten" : "Neue Mannschaft hinzufügen"}>
       {/* Added space-y-4 for spacing between form elements */}
       <form onSubmit={editingTeam ? handleEditTeam : handleAddTeam} className="space-y-4">
         {/* Floating Label for Name */}
         <label className="floating-label w-full">
           <input
             type="text"
             value={formData.name || ''}
             onChange={(e) => setFormData({...formData, name: e.target.value})}
             placeholder="Mannschaftsname" // Placeholder needed
             className="input input-bordered w-full"
             required
           />
           <span>Mannschaftsname</span>
         </label>

         {/* Floating Label for Location */}
         <label className="floating-label w-full">
           <input
             type="text"
             value={formData.location || ''}
             onChange={(e) => setFormData({...formData, location: e.target.value})}
             placeholder="Ort" // Placeholder needed
             className="input input-bordered w-full"
           />
           <span>Ort</span>
         </label>

         {/* Floating Label for Hall Address */}
         <label className="floating-label w-full">
           <input
             type="text"
             value={formData.hallAddress || ''}
             onChange={(e) => setFormData({...formData, hallAddress: e.target.value})}
             placeholder="Adresse der Halle" // Placeholder needed
             className="input input-bordered w-full"
           />
           <span>Adresse der Halle</span>
         </label>

         {/* Floating Label for Training Times */}
         <label className="floating-label w-full">
           <input
             type="text"
             value={formData.trainingTimes || ''}
             onChange={(e) => setFormData({...formData, trainingTimes: e.target.value})}
             placeholder="Trainingszeiten" // Placeholder needed
             className="input input-bordered w-full"
           />
           <span>Trainingszeiten</span>
         </label>
          {/* Team Leader Select - Using DaisyUI form-control structure */}
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Spielleiter</span>
            </div>
            <select
              id="teamleader" // Keep id for association if needed elsewhere
              value={formData.teamLeaderId || ''}
              onChange={(e) => setFormData({...formData, teamLeaderId: e.target.value})}
              className="select select-bordered w-full" // Use select-bordered
            >
              <option value="">Spielleiter auswählen (optional)</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {/* Optional: Add label-text-alt if needed */}
            {/* <div className="label">
              <span className="label-text-alt">Bottom Left label</span>
            </div> */}
          </label>
          
          <div className="modal-action mt-6"> {/* Wrap button in modal-action */}
            <button type="button" className="btn btn-ghost" onClick={() => { setIsModalOpen(false); setFormData({}); setEditingTeam(null); }}>Abbrechen</button>
            <button
              type="submit"
              className="btn btn-primary" // Removed w-full as modal-action handles alignment
            >
              {editingTeam ? "Aktualisieren" : "Hinzufügen"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DeleteConfirmation Komponente hinzufügen */}
      {showDeleteConfirmation && teamToDelete && (
        <DeleteConfirmation
          onConfirm={confirmDeleteTeam}
          onCancel={cancelDeleteTeam}
          message={`Möchten Sie die Mannschaft ${teamToDelete.name} wirklich löschen?`}
        />
      )}
    </>
  )
}
