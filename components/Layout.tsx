import React from 'react'
import Head from 'next/head'
import Navbar from './Navbar'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Volleyball Liga Manager</title>
        <meta name="description" content="Volleyball Liga Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </>
  )
}

export default Layout
