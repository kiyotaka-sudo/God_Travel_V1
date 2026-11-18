import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ compact = false }) {
  const [dark, setDark] = useState(() => {
    const saved = window.localStorage.getItem('god-travel-theme')
    return saved ? saved === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches || false
  })

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    window.localStorage.setItem('god-travel-theme', dark ? 'dark' : 'light')
  }, [dark])

  return <button className={`theme-toggle ${compact ? 'is-compact' : ''}`} type="button" onClick={() => setDark((value) => !value)} aria-label={dark ? 'Activer le thème clair' : 'Activer le thème sombre'} title={dark ? 'Thème clair' : 'Thème sombre'}>
    {dark ? <Sun size={16} /> : <Moon size={16} />}<span>{compact ? '' : dark ? 'Clair' : 'Sombre'}</span>
  </button>
}
