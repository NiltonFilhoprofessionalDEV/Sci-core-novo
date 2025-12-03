'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-transparent hover:bg-sidebar-accent/20 transition-all duration-200"
        aria-label="Toggle theme"
      >
        <Sun className="w-5 h-5 text-sidebar-foreground" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-transparent hover:bg-sidebar-accent/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 active:scale-95"
      aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-sidebar-foreground" />
      ) : (
        <Sun className="w-5 h-5 text-sidebar-foreground" />
      )}
    </button>
  )
}

