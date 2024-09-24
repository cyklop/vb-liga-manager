import Link from 'next/link'
import { useRouter } from 'next/router'

const Navbar = () => {
  const router = useRouter()

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Volleyball Liga
        </Link>
        <div className="space-x-4">
          <Link href="/tabelle" className="hover:underline">
            Tabelle
          </Link>
          <Link href="/spielplan" className="hover:underline">
            Spielplan
          </Link>
          {router.pathname !== '/login' && (
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
