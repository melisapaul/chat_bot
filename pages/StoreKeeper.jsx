import React, { useState, useEffect } from 'react'
import data from '../data/admin.json'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts'
import SortableTransactionTable from './SortableTransactionTable'; // Import the new component

export default function StoreKeeper() {
  const [newOfflineOrder, setNewOfflineOrder] = useState(null);

  // Check for new offline orders - clear on page refresh using window events
  useEffect(() => {
    const checkForNewOrder = () => {
      const orderData = sessionStorage.getItem('newOfflineOrder');
      if (orderData) {
        setNewOfflineOrder(JSON.parse(orderData));
        // Keep the notification for 15 seconds but don't clear sessionStorage
        setTimeout(() => {
          setNewOfflineOrder(null);
        }, 15000); // Hide notification after 15 seconds but keep data
      }
    };
    
    // Clear orders when page is about to unload (refresh/close)
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('newOfflineOrder');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    checkForNewOrder();
    // Check every 2 seconds for new orders
    const interval = setInterval(checkForNewOrder, 2000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const sold = data.storeStats.productsSold.map((item, index) => {
    const product = data.products.find(p => p.id === item.productId)
    return { 
      name: product ? product.name : `Product ${item.productId}`, 
      count: item.count,
      fill: 'url(#barGradient)'
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

  const COLORFUL_PALETTE = ['#b91c1c', '#dc2626', '#f59e0b', '#fbbf24', '#fb923c', '#ea580c', '#d97706']
  
  // Hardcoded data for 750 total orders distributed across 7 days
  const hardcodedOrders = [150, 105, 120, 90, 135, 75, 75]; // Total = 750
  
  const last7DaysData = last7Days.map((date, index) => ({
    name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    orders: hardcodedOrders[index],
    fill: COLORFUL_PALETTE[index]
  }))

  const totalOrders = 750;

  const PIE_COLORS = ['#6366f1', '#dc2626']
  const storeId="sk1"
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-xl">
          <p className="text-gray-900 font-semibold text-sm mb-1">{payload[0].payload.name}</p>
          <p className="text-red-800 text-sm">
            <span className="font-normal">Sales:</span> <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-12 w-12 bg-gradient-to-br from-red-800 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-900 via-red-800 to-amber-700 bg-clip-text text-transparent">
                Store Analytics Dashboard-ABFRL Southcity Store
              </h1>
              <p className="text-sm text-gray-600 mt-1 font-medium">Real-time performance metrics and insights</p>
            </div>
          </div>
          
          {/* New Offline Order Notification */}
          {newOfflineOrder && (
            <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">🔔 New Store Pickup Order!</h3>
                  <p className="text-orange-100">
                    Customer <span className="font-bold">{newOfflineOrder.userName}</span> selected your store for pickup
                  </p>
                  <p className="text-sm text-orange-200 mt-2">
                    Product: <span className="font-bold">{newOfflineOrder.product?.name}</span> - Check pending orders below
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts Container */}
        <div className="space-y-8 mb-8">
          {/* Product Performance Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-red-800 to-amber-600 p-6">
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
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fb923c" stopOpacity={0.95}/>
                        <stop offset="50%" stopColor="#f97316" stopOpacity={0.92}/>
                        <stop offset="100%" stopColor="#ea580c" stopOpacity={0.9}/>
                      </linearGradient>
                    </defs>
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
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(153, 27, 27, 0.08)' }} />
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Last 7 Days Orders Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-red-800 to-amber-600 p-6">
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
              <div className="bg-gradient-to-br from-amber-50 to-red-50 rounded-2xl p-6 mb-6 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">Total Orders</div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent">{totalOrders}</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">in the last 7 days</div>
                  </div>
                  <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div style={{ height: 450 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={last7DaysData} 
                      dataKey="orders" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={140}
                      innerRadius={85}
                      label={({ name, percent, fill }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                      style={{ fontSize: '0.75rem', fontWeight: '700' }}
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

              <div className="grid grid-cols-7 gap-3 mt-6">
                {last7DaysData.map((day, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-amber-300 transition-all hover:shadow-lg">
                    <div className="text-center">
                      <div className="w-6 h-6 rounded-full mx-auto mb-2" style={{ backgroundColor: day.fill }}></div>
                      <div className="text-sm text-gray-500 mb-1 font-semibold">{day.name}</div>
                      <div className="text-3xl font-bold text-gray-900">{day.orders}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Metrics */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-xl p-5 border-2 border-red-200">
                  <div className="text-sm text-red-800 font-bold uppercase tracking-wider mb-2">Peak Day</div>
                  <div className="text-3xl font-bold text-red-800">Dec 3</div>
                  <div className="text-base text-gray-600 mt-1">150 orders</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-5 border-2 border-amber-200">
                  <div className="text-sm text-amber-800 font-bold uppercase tracking-wider mb-2">Avg Daily</div>
                  <div className="text-3xl font-bold text-amber-800">107</div>
                  <div className="text-base text-gray-600 mt-1">orders per day</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                  <div className="text-sm text-orange-800 font-bold uppercase tracking-wider mb-2">Growth</div>
                  <div className="text-3xl font-bold text-orange-800">+12%</div>
                  <div className="text-base text-gray-600 mt-1">vs last week</div>
                </div>
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
