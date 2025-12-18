import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

type Theme = 'dark' | 'light'

export const Navbar = () => {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || 'dark'
  )

  const { user, accessToken, refreshToken, error } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!accessToken && !user) {
      refreshToken()
    }
  }, [accessToken, user, refreshToken])

  useEffect(() => {
    if (error) {
      navigate('/auth')
    }
  }, [error, navigate])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(theme === 'light' ? 'dark' : 'light')
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <nav className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="mx-auto px-4 py-2 flex items-center justify-between">
        
        {/* Left: App name + links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            WhatsKenoun
          </Link>

          <Link
            to="/search"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            Search
          </Link>
        </div>

        {/* Right: Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-6 w-6 text-zinc-800" />
          ) : (
            <Sun className="h-6 w-6 text-zinc-100" />
          )}
        </button>

      </div>
    </nav>
  )
}
