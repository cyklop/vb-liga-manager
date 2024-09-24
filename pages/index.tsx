import Head from 'next/head'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Volleyball Liga Manager</title>
        <meta name="description" content="Volleyball Liga Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Willkommen beim Volleyball Liga Manager
        </h1>
        <p className="text-center text-xl">
          Hier können Sie Spielergebnisse eintragen und die Ligatabelle verwalten.
        </p>
      </main>
    </div>
  )
}
