import React from 'react'
import data from '../data/admin.json'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts'
import SortableTransactionTable from './SortableTransactionTable'; // Import the new component

export default function StoreKeeper() {
  const sold = data.storeStats.productsSold.map((item, index) => {
    const product = data.products.find(p => p.id === item.productId)
    return { 
      name: product ? product.name : `Product ${item.productId}`, 
      count: item.count,
      fill: '#6366f1'
    }
  })

  // Calculate last 7 days order data
  const today = new Date('2025-12-09')
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    last7Days.push(d.toISOString().split('T')[0])
  }

  const ordersByDay = {}
  last7Days.forEach(d => ordersByDay[d] = 0)
  data.transactions.forEach(tx => {
    if (last7Days.includes(tx.date)) {
      ordersByDay[tx.date]++
    }
  })

  const last7DaysData = last7Days.map((date, index) => ({
    name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    orders: ordersByDay[date],
    fill: `hsl(${230 + index * 20}, 70%, ${55 + index * 3}%)`
  }))

  const totalOrders = Object.values(ordersByDay).reduce((sum, count) => sum + count, 0)

  const PIE_COLORS = ['#6366f1', '#dc2626']
  const storeId="sk1"
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-xl">
          <p className="text-gray-900 font-semibold text-sm mb-1">{payload[0].payload.name}</p>
          <p className="text-indigo-600 text-sm">
            <span className="font-normal">Sales:</span> <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }
  return (
    <div className="bg-white text-gray-900 font-sans text-[1.4vw] rounded-2xl shadow-sm p-8 border border-gray-100">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-2">Store Analytics</h2>
        <p className="text-sm text-gray-500 font-normal">Performance metrics and sales overview</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center mb-6">
            <div className="h-10 w-1 bg-indigo-600 rounded-full mr-4"></div>
            <h3 className="font-semibold text-xl text-gray-900 tracking-tight">Product Performance</h3>
          </div>
          <div style={{ height: 600 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sold} margin={{ bottom: 100, left: 20, right: 20, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={150} 
                  interval={0} 
                  style={{ fontSize: '0.65rem', fill: '#6b7280', fontWeight: '500' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  allowDecimals={false} 
                  style={{ fontSize: '0.75rem', fill: '#6b7280', fontWeight: '500' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center mb-6">
            <div className="h-10 w-1 bg-indigo-600 rounded-full mr-4"></div>
            <h3 className="font-semibold text-xl text-gray-900 tracking-tight">Last 7 Days Orders</h3>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm mb-8">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Orders</div>
            <div className="text-3xl font-light text-indigo-600">{totalOrders}</div>
            <div className="text-xs text-gray-400 mt-1">in the last 7 days</div>
          </div>

          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={last7DaysData} 
                  dataKey="orders" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={110}
                  innerRadius={65}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                  style={{ fontSize: '0.75rem', fill: '#374151', fontWeight: '600' }}
                  paddingAngle={2}
                >
                  {last7DaysData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      stroke="white"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '0.875rem', paddingTop: '20px', fontWeight: '500', color: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '10px',
                    color: '#111827',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-7 gap-2 mt-6">
            {last7DaysData.map((day, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                <div className="text-xs text-gray-500 mb-1">{day.name}</div>
                <div className="text-lg font-semibold text-indigo-600">{day.orders}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <SortableTransactionTable storeId={storeId} />
          </div>
        </div>
      </div>
    </div>
  )
}
