import React from 'react'
import data from '../data/admin.json'

export default function UserJourney() {
  const user = data.users.find(u => u.id === "00001")
  
  if (!user) {
    return <div className="bg-[#0d0d0d] text-gray-200 p-6">User not found</div>
  }

  const productMap = {}
  user.purchases.forEach(pid => {
    if(productMap[pid]==undefined){
      productMap[pid]=1
    }else{
      productMap[pid]=productMap[pid]+1
    }
     
  })

  return (
    <div className="bg-[#0d0d0d] text-gray-200 font-sans text-[1.4vw] rounded-xl shadow p-6 shadow">
      <div className="mb-6 bg-[#111] border border-gray-700 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-400">Username</p>
          <p className="text-2xl font-semibold text-white leading-tight">{user.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm uppercase tracking-wide text-gray-400">User ID</p>
          <p className="text-lg font-mono font-semibold text-blue-200 bg-[#0b0b0b] border border-gray-800 rounded-lg px-3 py-2 inline-block">{user.id}</p>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(productMap).map(pid => {
          const prod = data.products.find(p => p.id === pid)
          if (!prod) return null
          return (
            <div key={pid} className="border rounded-lg p-4 flex gap-4 items-center">
              <img src={prod.image} alt={prod.name} className="w-20 h-20 object-cover rounded" />
              <div>
                <div className="font-medium">{prod.name}</div>
                <div className="text-sm text-gray-500">₹{prod.price}</div>
                <div className="text-sm mt-2">Qty: <span className="font-semibold">{productMap[pid]}</span></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
