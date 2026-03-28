"use client";

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">{error?.message || 'An unexpected error occurred.'}</p>
        <div className="flex gap-4">
          <button onClick={() => reset()} className="px-6 py-3 bg-primary text-background rounded-lg">Try again</button>
          <a href="/" className="px-6 py-3 border border-border rounded-lg text-muted-foreground">Go home</a>
        </div>
      </main>
      <Footer />
    </>
  )
}
