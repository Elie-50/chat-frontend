import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Notifications from './Notifications'
import OnlineStateTracker from './OnlineStateTracker'

type Theme = 'dark' | 'light'

export const Navbar = () => {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || 'dark'
  )

  const { user, accessToken, refreshToken, error, accessTokenExpiresAt, logout } = useAuthStore()
  const navigate = useNavigate();

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (accessToken && accessTokenExpiresAt && Date.now() > accessTokenExpiresAt - 1 * 60 * 1000) {
        refreshToken();
      }
    }, 30000);

    return () => clearInterval(refreshInterval)
  }, [accessToken, accessTokenExpiresAt, refreshToken])
  
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

  const handleLogout = async () => {
    await logout();

    if (!error) {
      navigate('/auth');
    }
  }

  return (
    <nav className="w-full fixed top-0 left-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="mx-auto px-4 py-2 flex items-center justify-between">
        
        {/* Left: App name + links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            WhatsKenoun
          </Link>

          <Link to="/search" className="nav-link">Search</Link>
          <Link to="/groups" className="nav-link">Groups</Link>
        </div>

        {/* Right: Theme toggle */}
        <div>
          <button
            onClick={toggleTheme}
            className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-6 w-6 text-muted-foreground" />
            ) : (
              <Sun className="h-6 w-6 text-muted-foreground" />
            )}
          </button>

          <button
            aria-label='Logout'
            onClick={handleLogout}
            className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <LogOut className="h-6 w-6 text-muted-foreground rotate-180" />
          </button>
          <Notifications />
					<OnlineStateTracker />
        </div>
      </div>
    </nav>
  )
}
