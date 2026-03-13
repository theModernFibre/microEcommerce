import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { token } = useAuth()

  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        Welcome to MicroShop
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
        A microservices-based e-commerce demo built with Spring Boot, React, and Tailwind CSS.
        Register or log in to browse products, place orders, and manage inventory.
      </p>
      {!token ? (
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="px-6 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg border-2 border-slate-300 hover:border-primary-500 hover:text-primary-600 transition"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <Link
          to="/products"
          className="inline-block px-6 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition"
        >
          Browse Products
        </Link>
      )}
    </div>
  )
}
