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

  const COLORFUL_PALETTE = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
  
  const last7DaysData = last7Days.map((date, index) => ({
    name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    orders: ordersByDay[date],
    fill: COLORFUL_PALETTE[index]
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                Store Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1 font-medium">Real-time performance metrics and insights</p>
            </div>
          </div>
        </div>

        {/* Charts Container */}
        <div className="space-y-8 mb-8">
          {/* Product Performance Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Product Performance</h3>
              </div>
            </div>
            <div className="p-8">
              <div style={{ height: 650 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sold} margin={{ bottom: 120, left: 20, right: 20, top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={150} 
                      interval={0} 
                      style={{ fontSize: '0.65rem', fill: '#6b7280', fontWeight: '600' }}
                      axisLine={{ stroke: '#d1d5db' }}
                      tickLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      style={{ fontSize: '0.75rem', fill: '#6b7280', fontWeight: '600' }}
                      axisLine={{ stroke: '#d1d5db' }}
                      tickLine={{ stroke: '#d1d5db' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Last 7 Days Orders Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Last 7 Days Orders</h3>
              </div>
            </div>
            <div className="p-8">
              {/* Stats Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Total Orders</div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{totalOrders}</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">in the last 7 days</div>
                  </div>
                  <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={last7DaysData} 
                      dataKey="orders" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100}
                      innerRadius={60}
                      label={({ name, percent, fill }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                      style={{ fontSize: '0.7rem', fontWeight: '700' }}
                      paddingAngle={3}
                    >
                      {last7DaysData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill}
                          stroke="white"
                          strokeWidth={4}
                        />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={32}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '0.8rem', paddingTop: '15px', fontWeight: '600', color: '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '12px',
                        color: '#111827',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        padding: '14px',
                        fontWeight: '600'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-7 gap-2 mt-6">
                {last7DaysData.map((day, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-200 text-center hover:shadow-md transition-all hover:scale-105">
                    <div className="text-[0.65rem] font-bold text-gray-500 mb-1">{day.name}</div>
                    <div className="text-base font-bold" style={{ color: day.fill }}>{day.orders}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <SortableTransactionTable storeId={storeId} />
          </div>
        </div>
      </div>
    </div>
  )
}
