import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold tracking-tight">
              MicroShop
            </Link>
            <nav className="flex items-center gap-6">
              {token ? (
                <>
                  <Link to="/products" className="hover:text-primary-300 transition">Products</Link>
                  <Link to="/orders" className="hover:text-primary-300 transition">Orders</Link>
                  <Link to="/inventory" className="hover:text-primary-300 transition">Inventory</Link>
                  <span className="text-slate-400 text-sm">{user?.name || user?.email}</span>
                  <button onClick={handleLogout} className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 transition">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-primary-300 transition">Login</Link>
                  <Link to="/register" className="px-3 py-1.5 rounded bg-primary-500 hover:bg-primary-600 transition">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-slate-800 text-slate-400 py-4 text-center text-sm">
        MicroShop — Microservices Architecture • Spring Boot + React + Tailwind
      </footer>
    </div>
  )
}
