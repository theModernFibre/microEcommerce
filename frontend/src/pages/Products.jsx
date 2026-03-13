import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Products() {
  const { api } = useAuth()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    const path = search.trim() ? `/products?search=${encodeURIComponent(search.trim())}` : '/products'
    api(path)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load'))))
      .then(setProducts)
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search])

  const addProduct = (e) => {
    e.preventDefault()
    const form = e.target
    const payload = {
      name: form.name.value,
      description: form.description.value,
      price: parseFloat(form.price.value) || 0,
      sku: form.sku.value || null,
    }
    api('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => { form.reset(); load() })
      .catch(() => setError('Failed to add product'))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">{error}</div>
      )}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 w-64"
        />
      </div>
      <details className="mb-6">
        <summary className="cursor-pointer text-primary-600 font-medium">Add product</summary>
        <form onSubmit={addProduct} className="mt-4 p-4 bg-slate-100 rounded-lg space-y-3 max-w-md">
          <input name="name" placeholder="Name" required className="w-full px-3 py-2 border rounded-lg" />
          <input name="description" placeholder="Description" className="w-full px-3 py-2 border rounded-lg" />
          <input name="price" type="number" step="0.01" placeholder="Price" className="w-full px-3 py-2 border rounded-lg" />
          <input name="sku" placeholder="SKU" className="w-full px-3 py-2 border rounded-lg" />
          <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">Add</button>
        </form>
      </details>
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-slate-600 text-sm mt-1">{p.description}</p>
              <p className="mt-2 font-medium text-primary-600">${Number(p.price).toFixed(2)}</p>
              {p.sku && <p className="text-xs text-slate-400">SKU: {p.sku}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
