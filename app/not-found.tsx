import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">We couldn’t find the page you’re looking for.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-background rounded-lg">Go home</Link>
      </main>
      <Footer />
    </>
  )
}
