import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Orders() {
  const { api, user } = useAuth()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api('/orders?userEmail=' + encodeURIComponent(user?.email || '')).then((r) => r.json()),
      api('/products').then((r) => r.json()),
    ])
      .then(([o, p]) => {
        setOrders(Array.isArray(o) ? o : [])
        setProducts(Array.isArray(p) ? p : [])
      })
      .finally(() => setLoading(false))
  }, [user?.email])

  const createOrder = (e) => {
    e.preventDefault()
    const form = e.target
    const productId = Number(form.productId.value)
    const qty = Number(form.quantity.value) || 1
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const items = [{ productId: product.id, productName: product.name, quantity: qty, unitPrice: product.price }]
    api('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: user?.email, items }),
    })
      .then((r) => r.json())
      .then(() => api('/orders?userEmail=' + encodeURIComponent(user?.email)).then((r) => r.json()).then(setOrders))
  }

  if (loading) return <p className="text-slate-500">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <details className="mb-6">
        <summary className="cursor-pointer text-primary-600 font-medium">Place order</summary>
        <form onSubmit={createOrder} className="mt-4 p-4 bg-slate-100 rounded-lg flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
            <select name="productId" required className="px-3 py-2 border rounded-lg">
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ${Number(p.price).toFixed(2)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input name="quantity" type="number" min="1" defaultValue="1" className="px-3 py-2 border rounded-lg w-24" />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">Place order</button>
        </form>
      </details>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-slate-500">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="font-medium">Order #{order.id}</span>
                <span className="text-slate-500 text-sm">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-primary-600 font-semibold mt-1">${Number(order.totalAmount).toFixed(2)}</p>
              <p className="text-slate-500 text-sm">Status: {order.status}</p>
              <ul className="mt-2 text-sm text-slate-600">
                {order.items?.map((item, i) => (
                  <li key={i}>{item.productName} × {item.quantity} @ ${Number(item.unitPrice).toFixed(2)}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
