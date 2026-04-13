import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    // Recuperar preferencia de localStorage o del sistema
    const temaGuardado = localStorage.getItem('petrochat-theme')
    if (temaGuardado) return temaGuardado
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    // Aplicar clase al HTML
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(tema)
    localStorage.setItem('petrochat-theme', tema)
  }, [tema])

  const toggleTema = () => {
    setTema((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ tema, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return context
}
