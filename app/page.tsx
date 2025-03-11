'use client'

import TtsInterface from "@/components/tts-interface"
import { useEffect } from "react"

declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data: unknown) => void;
      on: (channel: string, func: (...args: unknown[]) => void) => void;
    }
  }
}

export default function Home() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.send('keyPress', e.key);
      }
      console.log('Key pressed:', e.key)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <TtsInterface />
    </main>
  )
}

