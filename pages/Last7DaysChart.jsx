import React from 'react'
import data from '../data/admin.json'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Last7DaysChart() {
  // Calculate last 7 days
  const today = new Date('2025-12-09')
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    last7Days.push(d.toISOString().split('T')[0])
  }

  // Count orders by day
  const ordersByDay = {}
  last7Days.forEach(d => ordersByDay[d] = 0)
  
  data.transactions.forEach(tx => {
    if (last7Days.includes(tx.date)) {
      ordersByDay[tx.date]++
    }
  })

  // Prepare chart data
  const chartData = last7Days.map((date, index) => {
    const dateObj = new Date(date)
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
    const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    return {
      name: `${dayName}, ${monthDay}`,
      orders: ordersByDay[date],
      fill: COLORS[index % COLORS.length]
    }
  })

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981']

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-xl">
          <p className="text-gray-900 font-semibold text-sm mb-1">{payload[0].name}</p>
          <p className="text-indigo-600 text-sm">
            <span className="font-normal">Orders:</span> <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0)

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center">
            <div className="h-10 w-1 bg-indigo-600 rounded-full mr-4"></div>
            <h3 className="font-semibold text-xl text-gray-900 tracking-tight">Last 7 Days Orders</h3>
          </div>
          <p className="text-sm text-gray-500 mt-2 ml-5">Order distribution by day</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Orders</div>
          <div className="text-3xl font-light text-indigo-600">{totalOrders}</div>
        </div>
      </div>

      <div style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={chartData} 
              dataKey="orders" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={130}
              label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
              labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
              style={{ fontSize: '0.75rem', fill: '#374151', fontWeight: '600' }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ 
                fontSize: '0.8rem', 
                paddingTop: '20px', 
                fontWeight: '500', 
                color: '#6b7280' 
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-7 gap-2">
          {chartData.map((day, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-xs font-semibold text-gray-500 mb-1">{day.name.split(',')[0]}</div>
              <div className="text-lg font-semibold" style={{ color: day.fill }}>{day.orders}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
