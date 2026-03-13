import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Inventory() {
  const { api } = useAuth()
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api('/inventory').then((r) => r.json()).then(setStock).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const addStock = (e) => {
    e.preventDefault()
    const form = e.target
    const payload = { productId: Number(form.productId.value), quantity: Number(form.quantity.value) || 0 }
    api('/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then(() => { form.reset(); load() })
  }

  const updateQty = (id, quantity) => {
    api(`/inventory/${id}/quantity`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(() => load())
  }

  if (loading) return <p className="text-slate-500">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>
      <details className="mb-6">
        <summary className="cursor-pointer text-primary-600 font-medium">Add stock entry</summary>
        <form onSubmit={addStock} className="mt-4 p-4 bg-slate-100 rounded-lg flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product ID</label>
            <input name="productId" type="number" required className="px-3 py-2 border rounded-lg w-32" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input name="quantity" type="number" min="0" required className="px-3 py-2 border rounded-lg w-24" />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">Add</button>
        </form>
      </details>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-xl border border-slate-200 shadow-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Product ID</th>
              <th className="text-left p-3">Quantity</th>
              <th className="text-left p-3">Location</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((s) => (
              <tr key={s.id} className="border-t border-slate-200">
                <td className="p-3">{s.id}</td>
                <td className="p-3">{s.productId}</td>
                <td className="p-3">{s.quantity}</td>
                <td className="p-3">{s.location || '—'}</td>
                <td className="p-3">
                  <input
                    type="number"
                    min="0"
                    defaultValue={s.quantity}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    onBlur={(e) => {
                      const v = parseInt(e.target.value, 10)
                      if (!isNaN(v) && v !== s.quantity) updateQty(s.id, v)
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {stock.length === 0 && <p className="text-slate-500 mt-4">No inventory entries.</p>}
    </div>
  )
}
