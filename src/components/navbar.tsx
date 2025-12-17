import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'

type Theme = 'dark' | 'light';

export const Navbar = () => {
  const [theme, setTheme] = useState<Theme>(localStorage.getItem('theme') as Theme || 'dark')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(theme === 'light' ? 'dark' : 'light')
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
		localStorage.setItem('theme', newTheme);
  }

  return (
    <nav className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left */}
        <Link
          to="/"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          WhatsKenoun
        </Link>

        {/* Right */}
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer transition"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-7 w-7 text-zinc-800" />
          ) : (
            <Sun className="h-7 w-7 text-zinc-100" />
          )}
        </button>
      </div>
    </nav>
  )
}

