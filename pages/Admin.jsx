// import React from 'react'
// import data from '../data/data.json'
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// export default function Admin() {
//   const totals = {
//     users: data.users.length,
//     products: data.products.length,
//     storeKeepers: data.storeKeepers.length
//   }

//   const userPurchaseCounts = data.users.map(u => ({
//     name: u.name,
//     purchases: u.purchases.length
//   }))

//   return (
//     <div className="bg-white rounded-xl shadow p-6">
//       <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="p-4 border rounded">
//           <div className="text-sm text-gray-500">Users</div>
//           <div className="text-2xl font-bold">{totals.users}</div>
//         </div>
//         <div className="p-4 border rounded">
//           <div className="text-sm text-gray-500">Products</div>
//           <div className="text-2xl font-bold">{totals.products}</div>
//         </div>
//         <div className="p-4 border rounded">
//           <div className="text-sm text-gray-500">Store Keepers</div>
//           <div className="text-2xl font-bold">{totals.storeKeepers}</div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="p-4 border rounded">
//           <h3 className="font-medium mb-3">Which user bought which product</h3>
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-left text-gray-600">
//                 <th className="pb-2">User</th>
//                 <th className="pb-2">Products</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.users.map(u => (
//                 <tr key={u.id} className="border-t">
//                   <td className="py-2">{u.name}</td>
//                   <td className="py-2">
//                     {u.purchases.map((pid, i) => {
//                       const p = data.products.find(x => x.id === pid)
//                       return <span key={i} className="inline-block mr-2 px-2 py-1 bg-gray-100 rounded text-xs">{p ? p.name : pid}</span>
//                     })}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="p-4 border rounded">
//           <h3 className="font-medium mb-3">Purchases per User</h3>
//           <div style={{ height: 300 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={userPurchaseCounts}>
//                 <XAxis dataKey="name" />
//                 <YAxis allowDecimals={false} />
//                 <Tooltip />
//                 <Bar dataKey="purchases" fill="#10b981" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
import React, { useState, useMemo } from "react";
import data from "../data/admin.json";
import { ChevronDown, ChevronUp } from "lucide-react";

import SortableTransactionTable from "./SortableTransactionTable"; // Import the new component

// Import necessary Recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Admin() {
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("overview"); // 'overview', 'online', 'offline'

  // --- Data Processing for existing components ---
  const totals = {
    users: data.users.length,
    products: data.products.length,
    storeKeepers: data.storeKeepers.length,
  };
  const userPurchaseCounts = data.users.map((u) => ({
    name: u.name,
    purchases: u.purchases.length,
  }));

  // --- 1. Data Processing for Online | Offline Pie Chart ---
  // Hardcoded revenue values in thousands: ₹26,000,000 online, ₹17,500,000 offline
  const purchaseModeData = [
    { name: 'Online', value: 26000 },
    { name: 'Offline', value: 17500 }
  ];
  
  const totalRevenue = 43500; // Total revenue in thousands (₹43,500,000 or ₹4.35 crore)

  const COLORS = ["#991b1b", "#f59e0b"]; // Red for Online, Amber for Offline

  // Enhanced data processing based on view mode
  const getFilteredData = () => {
    if (viewMode === "overview") {
      return purchaseModeData;
    } else if (viewMode === "online") {
      // Group online transactions by user or product
      const onlineTransactions = data.transactions.filter(
        (t) => t.mode === "Online"
      );
      const onlineByUser = {};
      onlineTransactions.forEach((trans) => {
        const user = data.users.find((u) => u.id === trans.userId);
        const userName = user ? user.name : `User ${trans.userId}`;
        onlineByUser[userName] = (onlineByUser[userName] || 0) + trans.amount;
      });
      return Object.entries(onlineByUser)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) // Top 10 users
        .map(([name, value], index) => ({
          name: `Customer ${index + 1}`,
          value,
        }));
    } else if (viewMode === "offline") {
      // Group offline transactions by store
      const offlineTransactions = data.transactions.filter(
        (t) => t.mode === "Offline" && t.storeId
      );
      const offlineByStore = {};
      offlineTransactions.forEach((trans) => {
        const store = data.storeKeepers.find((s) => s.id === trans.storeId);
        const storeName = store ? store.store_name : `Store ${trans.storeId}`;
        offlineByStore[storeName] =
          (offlineByStore[storeName] || 0) + trans.amount;
      });
      return Object.entries(offlineByStore)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }));
    }
  };

  const filteredData = getFilteredData();

  // Dynamic colors for different view modes
  const getColors = () => {
    if (viewMode === "online") {
      return [
        "#7f1d1d",
        "#991b1b",
        "#b91c1c",
        "#dc2626",
        "#ef4444",
        "#f87171",
        "#fb923c",
        "#c2410c",
        "#9a3412",
        "#7c2d12",
      ];
    } else if (viewMode === "offline") {
      return [
        "#d97706",
        "#f59e0b",
        "#fbbf24",
        "#fcd34d",
        "#fb923c",
        "#ea580c",
        "#c2410c",
        "#92400e",
        "#78350f",
        "#451a03",
      ];
    }
    return COLORS;
  };

  // --- 2. Data Processing for On Store Tables ---

  // Hardcoded store purchases totaling 52000
  const storePurchases = [
    { storeId: "sk1", count: 4800 },
    { storeId: "sk2", count: 4200 },
    { storeId: "sk3", count: 3900 },
    { storeId: "sk4", count: 3600 },
    { storeId: "sk5", count: 3400 },
    { storeId: "sk6", count: 3200 },
    { storeId: "sk7", count: 3100 },
    { storeId: "sk8", count: 2900 },
    { storeId: "sk9", count: 2800 },
    { storeId: "sk10", count: 2600 },
    { storeId: "sk11", count: 2500 },
    { storeId: "sk12", count: 2400 },
    { storeId: "sk13", count: 2300 },
    { storeId: "sk14", count: 2200 },
    { storeId: "sk15", count: 8100 }
  ];

  // --- 3. Data Processing for Transactions: Month wise ---
  // Hardcoded monthly data matching 25000 online and 17000 offline total
  const monthlyData = [
    { name: 'Jan', Online: 1800, Offline: 1200 },
    { name: 'Feb', Online: 1900, Offline: 1300 },
    { name: 'Mar', Online: 2100, Offline: 1400 },
    { name: 'Apr', Online: 2200, Offline: 1450 },
    { name: 'May', Online: 2000, Offline: 1350 },
    { name: 'Jun', Online: 2300, Offline: 1500 },
    { name: 'Jul', Online: 2400, Offline: 1600 },
    { name: 'Aug', Online: 2200, Offline: 1500 },
    { name: 'Sep', Online: 2000, Offline: 1400 },
    { name: 'Oct', Online: 2300, Offline: 1500 },
    { name: 'Nov', Online: 2400, Offline: 1550 },
    { name: 'Dec', Online: 2400, Offline: 1750 }
  ];
  const storeId = "";

  const getStoreNameById = (id) => {
    const store = data.storeKeepers.find((item) => item.id == id);
    return store ? store.store_name : "Unknown Store";
  };

  // Advanced Store Performance Analytics with hardcoded purchase counts
  const storeAnalytics = useMemo(() => {
    const storeStats = {};
    
    // Hardcoded purchase counts matching the table
    const hardcodedPurchases = {
      "sk1": 4800,
      "sk2": 4200,
      "sk3": 3900,
      "sk4": 3600,
      "sk5": 3400,
      "sk6": 3200,
      "sk7": 3100,
      "sk8": 2900,
      "sk9": 2800,
      "sk10": 2600,
      "sk11": 2500,
      "sk12": 2400,
      "sk13": 2300,
      "sk14": 2200,
      "sk15": 8100
    };

    // Initialize store stats
    data.storeKeepers.forEach((store) => {
      storeStats[store.id] = {
        id: store.id,
        name: store.store_name,
        manager: store.name,
        totalRevenue: 0,
        totalTransactions: hardcodedPurchases[store.id] || 0,
        completedOrders: 0,
        pendingOrders: 0,
        avgOrderValue: 0,
        monthlyTrend: {},
        topProducts: {},
        customerCount: new Set(),
        performance: "average",
      };
    });

    // Calculate metrics from transactions
    data.transactions
      .filter((t) => t.mode === "Offline" && t.storeId)
      .forEach((transaction) => {
        const store = storeStats[transaction.storeId];
        if (store) {
          store.totalRevenue += transaction.amount;
          store.customerCount.add(transaction.userId);

          if (transaction.orderStatus === "Complete") {
            store.completedOrders++;
          } else {
            store.pendingOrders++;
          }

          // Monthly trend
          if (!store.monthlyTrend[transaction.month]) {
            store.monthlyTrend[transaction.month] = { revenue: 0, orders: 0 };
          }
          store.monthlyTrend[transaction.month].revenue += transaction.amount;
          store.monthlyTrend[transaction.month].orders++;

          // Top products
          if (!store.topProducts[transaction.productId]) {
            store.topProducts[transaction.productId] = { count: 0, revenue: 0 };
          }
          store.topProducts[transaction.productId].count += transaction.qty;
          store.topProducts[transaction.productId].revenue +=
            transaction.amount;
        }
      });

    // Calculate derived metrics and performance
    Object.keys(storeStats).forEach((storeId) => {
      const store = storeStats[storeId];
      store.avgOrderValue =
        store.totalTransactions > 0
          ? store.totalRevenue / store.totalTransactions
          : 0;
      store.completionRate =
        store.totalTransactions > 0
          ? (store.completedOrders / store.totalTransactions) * 100
          : 0;
      store.uniqueCustomers = store.customerCount.size;

      // Performance classification
      if (store.totalRevenue > 25000) {
        store.performance = "excellent";
      } else if (store.totalRevenue > 15000) {
        store.performance = "good";
      } else if (store.totalRevenue > 8000) {
        store.performance = "average";
      } else {
        store.performance = "poor";
      }
    });

    return Object.values(storeStats).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );
  }, []);

  // Get performance recommendations
  const getStoreRecommendations = (store) => {
    const recommendations = [];

    if (store.performance === "excellent") {
      recommendations.push(
        "🎯 Maintain current strategies and consider expansion"
      );
      recommendations.push("📈 Explore premium product lines to increase AOV");
    } else if (store.performance === "good") {
      recommendations.push("🚀 Focus on customer retention programs");
      recommendations.push(
        "💡 Implement targeted promotions for slow-moving products"
      );
    } else if (store.performance === "average") {
      recommendations.push(
        "📊 Analyze customer preferences and optimize inventory"
      );
      recommendations.push("🎪 Increase marketing efforts and staff training");
    } else {
      recommendations.push(
        "🔧 Urgent: Review operational efficiency and costs"
      );
      recommendations.push(
        "📱 Implement digital marketing and customer engagement"
      );
      recommendations.push(
        "👥 Consider staff retraining or management changes"
      );
    }

    if (store.completionRate < 90) {
      recommendations.push("⚡ Improve order fulfillment processes");
    }

    if (store.avgOrderValue < 1500) {
      recommendations.push(
        "💰 Focus on upselling and cross-selling strategies"
      );
    }

    return recommendations;
  };

  // Hardcoded poor performing stores for highlights
  const poorPerformingStores = [
    {
      id: "poor1",
      name: "Connaught Place Outlet",
      manager: "Rajesh Kumar",
      totalRevenue: 4500,
      totalTransactions: 12,
      completedOrders: 8,
      pendingOrders: 4,
      avgOrderValue: 375,
      uniqueCustomers: 8,
      completionRate: 66.7,
      performance: "poor",
    },
    {
      id: "poor2",
      name: "Sector 18 Store",
      manager: "Priya Sharma",
      totalRevenue: 3200,
      totalTransactions: 9,
      completedOrders: 5,
      pendingOrders: 4,
      avgOrderValue: 356,
      uniqueCustomers: 6,
      completionRate: 55.6,
      performance: "poor",
    },
    {
      id: "poor3",
      name: "Mall Road Branch",
      manager: "Amit Singh",
      totalRevenue: 2800,
      totalTransactions: 8,
      completedOrders: 4,
      pendingOrders: 4,
      avgOrderValue: 350,
      uniqueCustomers: 5,
      completionRate: 50.0,
      performance: "poor",
    },
    {
      id: "poor4",
      name: "City Center Store",
      manager: "Neha Gupta",
      totalRevenue: 2100,
      totalTransactions: 6,
      completedOrders: 3,
      pendingOrders: 3,
      avgOrderValue: 350,
      uniqueCustomers: 4,
      completionRate: 50.0,
      performance: "poor",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-800 to-amber-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent">
              Operations-Revenue Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Complete analytics and performance metrics</p>
          </div>
        </div>

      {/* Totals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-sm text-gray-500 mb-2">No of Customer</div>
          <div className="text-4xl font-bold text-red-800">13547</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-sm text-gray-500 mb-2">No of Product Sold</div>
          <div className="text-4xl font-bold text-amber-600">52064</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="text-sm text-gray-500 mb-2">No of Retail Stores</div>
          <div className="text-4xl font-bold text-orange-600">{totals.storeKeepers}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 1. Enhanced Pie Chart with View Options */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-800 to-amber-600 p-6">
            <h3 className="text-xl font-bold text-white mb-3">
              {viewMode === "overview" &&
                "Total Transactions: Online vs Offline(Past 1 Month)"}
              {viewMode === "online" && "Online Sales by Top Customers"}
              {viewMode === "offline" && "Offline Sales by Store"}
            </h3>
            <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1.5 gap-1">
              <button
                onClick={() => setViewMode("overview")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === "overview"
                    ? "bg-white text-red-800 shadow-lg"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode("online")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === "online"
                    ? "bg-white text-red-800 shadow-lg"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setViewMode("offline")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === "offline"
                    ? "bg-white text-red-800 shadow-lg"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Offline
              </button>
            </div>
          </div>

          {/* Chart Container */}
          <div className="p-6 pb-0">
            <div style={{ height: 400, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getColors()[index % getColors().length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `₹${value.toLocaleString()}`,
                      viewMode === "overview" ? "Total Amount" : "Revenue",
                    ]}
                    labelFormatter={(label) =>
                      viewMode === "online" ? "" : `${label}`
                    }
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  {viewMode !== "online" && (
                    <Legend
                      verticalAlign="bottom"
                      height={50}
                      wrapperStyle={{
                        paddingTop: "10px",
                        fontSize: "11px",
                      }}
                      formatter={(value) =>
                        value.length > 20
                          ? `${value.substring(0, 20)}...`
                          : value
                      }
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Total Revenue Stats Below Chart */}
            <div className="mt-6 space-y-4">
              <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-2xl p-6 border-2 border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-800 to-amber-600 flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider text-gray-600 font-semibold mb-1">Total Revenue</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent">
                        ₹{(totalRevenue * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center bg-white rounded-xl px-5 py-3 shadow-md">
                      <p className="text-xs text-gray-500 mb-1">Transactions</p>
                      <p className="text-2xl font-bold text-red-800">42000</p>
                    </div>
                    <div className="text-center bg-white rounded-xl px-5 py-3 shadow-md">
                      <p className="text-xs text-gray-500 mb-1">Avg Value</p>
                      <p className="text-2xl font-bold text-amber-600">
                        ₹{Math.round((totalRevenue * 1000) / 42000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Revenue Breakdown by Mode */}
              <div className="grid grid-cols-2 gap-4">
                {filteredData.map((item, index) => {
                  const percentage = ((item.value / filteredData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1);
                  const isOnline = item.name === 'Online';
                  return (
                    <div key={index} className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-amber-300 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-red-800' : 'bg-amber-500'}`}></div>
                          <span className="font-semibold text-gray-900">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-red-800">{percentage}%</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">₹{item.value.toLocaleString()}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${isOnline ? 'bg-gradient-to-r from-red-800 to-red-600' : 'bg-gradient-to-r from-amber-500 to-yellow-400'}`} 
                          style={{width: `${percentage}%`}}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Store Purchases Table */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-800 to-amber-600 p-6">
            <h3 className="text-xl font-bold text-white">Offline Purchases per Store</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="pb-4 text-left text-sm font-bold text-gray-700">Store Name</th>
                    <th className="pb-4 text-left text-sm font-bold text-gray-700">Purchases Count</th>
                  </tr>
                </thead>
                <tbody>
                  {storePurchases.map((store, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-amber-50 transition-colors`}>
                      <td className="py-4 text-gray-900">{getStoreNameById(store.storeId)}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center bg-amber-100 text-red-800 px-3 py-1 rounded-lg font-semibold">
                          {store.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Transactions Chart */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-red-800 to-amber-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Monthly Transaction Trends</h3>
                <p className="text-sm text-indigo-100 mt-1">Online vs Offline sales comparison</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div style={{ height: 450 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barGap={8}
              >
                <defs>
                  <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b91c1c" stopOpacity={0.98}/>
                    <stop offset="50%" stopColor="#991b1b" stopOpacity={0.95}/>
                    <stop offset="100%" stopColor="#7f1d1d" stopOpacity={0.92}/>
                  </linearGradient>
                  <linearGradient id="colorOffline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.98}/>
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.95}/>
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.92}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  style={{ fontSize: '13px', fontWeight: '600' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  allowDecimals={false}
                  stroke="#6b7280"
                  style={{ fontSize: '13px', fontWeight: '600' }}
                  label={{ value: 'Number of Transactions', angle: -90, position: 'insideLeft', style: { fill: '#4b5563', fontWeight: '600' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}
                  cursor={{ fill: 'rgba(153, 27, 27, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontWeight: '600', fontSize: '14px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="Online" 
                  stackId="a" 
                  fill="url(#colorOnline)"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="Offline" 
                  stackId="a" 
                  fill="url(#colorOffline)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full bg-red-800"></div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Online Transactions</p>
              </div>
              <p className="text-4xl font-bold text-red-800">
                {monthlyData.reduce((sum, item) => sum + (item.Online || 0), 0)}
              </p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full bg-amber-600"></div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Offline Transactions</p>
              </div>
              <p className="text-4xl font-bold text-amber-600">
                {monthlyData.reduce((sum, item) => sum + (item.Offline || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights and Recommendation Section */}
      <div className="mb-8">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-800 to-amber-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  AI Insights & Recommendations
                </h3>
              </div>
              <button
                onClick={() => setIsHighlightsOpen(!isHighlightsOpen)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-semibold transition-all"
              >
                <span>{isHighlightsOpen ? 'Hide Details' : 'View Insights'}</span>
                {isHighlightsOpen ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {isHighlightsOpen && (
            <div className="p-8">
              <div className="space-y-8">
                  {/* Store Performance Overview */}
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Store Performance Overview
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {storeAnalytics.map((store, index) => {
                        const performanceColors = {
                          excellent:
                            "bg-emerald-50 border-emerald-200 text-emerald-800",
                          good: "bg-blue-50 border-blue-200 text-blue-800",
                          average:
                            "bg-amber-50 border-amber-200 text-amber-800",
                          poor: "bg-red-50 border-red-200 text-red-800",
                        };

                        const rankEmojis = ["🥇", "🥈", "🥉"];

                        return (
                          <div
                            key={store.id}
                            className={`p-4 rounded-lg border-2 ${
                              performanceColors[store.performance]
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg">
                                {rankEmojis[index] || "🏪"}
                              </span>
                              <span className="text-xs font-bold uppercase tracking-wider">
                                {store.performance}
                              </span>
                            </div>
                            <h5 className="font-bold text-sm mb-1">
                              {store.name}
                            </h5>
                            <div className="text-xs space-y-1">
                              <p>
                                <strong>Revenue:</strong> ₹
                                {store.totalRevenue.toLocaleString()}
                              </p>
                              <p>
                                <strong>Orders:</strong>{" "}
                                {store.totalTransactions}
                              </p>
                              <p>
                                <strong>AOV:</strong> ₹
                                {Math.round(store.avgOrderValue)}
                              </p>
                              <p>
                                <strong>Customers:</strong>{" "}
                                {store.uniqueCustomers}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top & Bottom Performers */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-200">
                      <h4 className="text-lg font-bold text-emerald-800 mb-3 flex items-center">
                        🌟 Top Performer
                      </h4>
                      {storeAnalytics[0] && (
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-bold text-emerald-900">
                              {storeAnalytics[0].name}
                            </h5>
                            <p className="text-sm text-emerald-700">
                              Manager: {storeAnalytics[0].manager}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white p-2 rounded">
                              <p className="font-semibold text-emerald-800">
                                ₹
                                {storeAnalytics[0].totalRevenue.toLocaleString()}
                              </p>
                              <p className="text-xs text-emerald-600">
                                Total Revenue
                              </p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <p className="font-semibold text-emerald-800">
                                {Math.round(storeAnalytics[0].completionRate)}%
                              </p>
                              <p className="text-xs text-emerald-600">
                                Success Rate
                              </p>
                            </div>
                          </div>
                          <div className="bg-emerald-100 p-3 rounded">
                            <p className="text-xs font-semibold text-emerald-800 mb-1">
                              Success Factors:
                            </p>
                            <ul className="text-xs text-emerald-700 space-y-1">
                              <li>
                                • High customer retention (
                                {storeAnalytics[0].uniqueCustomers} unique
                                customers)
                              </li>
                              <li>
                                • Strong average order value (₹
                                {Math.round(storeAnalytics[0].avgOrderValue)})
                              </li>
                              <li>• Excellent order completion rate</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-red-50 p-5 rounded-lg border border-red-200">
                      <h4 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                        📊 Needs Attention
                      </h4>
                      {storeAnalytics[storeAnalytics.length - 1] && (
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-bold text-red-900">
                              {storeAnalytics[storeAnalytics.length - 1].name}
                            </h5>
                            <p className="text-sm text-red-700">
                              Manager:{" "}
                              {
                                storeAnalytics[storeAnalytics.length - 1]
                                  .manager
                              }
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white p-2 rounded">
                              <p className="font-semibold text-red-800">
                                ₹
                                {storeAnalytics[
                                  storeAnalytics.length - 1
                                ].totalRevenue.toLocaleString()}
                              </p>
                              <p className="text-xs text-red-600">
                                Total Revenue
                              </p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <p className="font-semibold text-red-800">
                                {Math.round(
                                  storeAnalytics[storeAnalytics.length - 1]
                                    .completionRate
                                )}
                                %
                              </p>
                              <p className="text-xs text-red-600">
                                Success Rate
                              </p>
                            </div>
                          </div>
                          <div className="bg-red-100 p-3 rounded">
                            <p className="text-xs font-semibold text-red-800 mb-1">
                              Improvement Areas:
                            </p>
                            <ul className="text-xs text-red-700 space-y-1">
                              <li>
                                • Low customer base (
                                {
                                  storeAnalytics[storeAnalytics.length - 1]
                                    .uniqueCustomers
                                }{" "}
                                customers)
                              </li>
                              <li>
                                • Below-average order value (₹
                                {Math.round(
                                  storeAnalytics[storeAnalytics.length - 1]
                                    .avgOrderValue
                                )}
                                )
                              </li>
                              <li>• Requires strategic intervention</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Poor Performing Stores Section */}
                  <div>
                    <h4 className="text-lg font-bold text-red-800 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      🚨 Critical: Poor Performing Stores
                    </h4>
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-red-900 font-bold text-sm">
                            ⚠️ URGENT ATTENTION REQUIRED
                          </p>
                          <p className="text-red-700 text-xs">
                            These stores are significantly underperforming and
                            require immediate intervention
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-900 font-bold text-lg">
                            {poorPerformingStores.length}
                          </p>
                          <p className="text-red-600 text-xs">Stores at Risk</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {poorPerformingStores.map((store) => (
                        <div
                          key={store.id}
                          className="bg-white border-2 border-red-300 rounded-lg p-4 shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h5 className="font-bold text-red-900 text-sm">
                                {store.name}
                              </h5>
                              <p className="text-red-700 text-xs">
                                Manager: {store.manager}
                              </p>
                            </div>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold uppercase">
                              {store.performance}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                            <div className="bg-red-50 p-2 rounded">
                              <p className="font-semibold text-red-800">
                                ₹{store.totalRevenue.toLocaleString()}
                              </p>
                              <p className="text-red-600">Revenue</p>
                            </div>
                            <div className="bg-red-50 p-2 rounded">
                              <p className="font-semibold text-red-800">
                                {store.completionRate}%
                              </p>
                              <p className="text-red-600">Success Rate</p>
                            </div>
                            <div className="bg-red-50 p-2 rounded">
                              <p className="font-semibold text-red-800">
                                {store.totalTransactions}
                              </p>
                              <p className="text-red-600">Orders</p>
                            </div>
                            <div className="bg-red-50 p-2 rounded">
                              <p className="font-semibold text-red-800">
                                {store.uniqueCustomers}
                              </p>
                              <p className="text-red-600">Customers</p>
                            </div>
                          </div>

                          <div className="bg-red-100 p-3 rounded">
                            <p className="text-xs font-semibold text-red-800 mb-1">
                              Immediate Actions:
                            </p>
                            <ul className="text-xs text-red-700 space-y-1">
                              <li>
                                🔧 Review operational costs and efficiency
                              </li>
                              <li>👥 Staff retraining and management review</li>
                              <li>📱 Implement digital marketing campaigns</li>
                              <li>💰 Focus on customer acquisition</li>
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 bg-gradient-to-r from-red-100 to-orange-100 border border-red-200 rounded-lg p-4">
                      <h5 className="font-bold text-red-900 mb-2">
                        📋 Recommended Action Plan for Poor Performers:
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-semibold text-red-800 mb-1">
                            Week 1-2: Assessment
                          </p>
                          <ul className="text-red-700 space-y-1">
                            <li>• Conduct thorough store audit</li>
                            <li>• Analyze customer feedback</li>
                            <li>• Review inventory turnover</li>
                            <li>• Assess staff performance</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-red-800 mb-1">
                            Week 3-4: Implementation
                          </p>
                          <ul className="text-red-700 space-y-1">
                            <li>• Launch targeted marketing campaigns</li>
                            <li>• Implement staff training programs</li>
                            <li>• Optimize product mix and pricing</li>
                            <li>• Set up weekly performance reviews</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strategic Recommendations for Poor Performers Only */}
                  <div>
                    <h4 className="text-lg font-bold text-red-800 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      Strategic Recommendations for Poor Performing Stores
                    </h4>
                    <div className="space-y-4">
                      {poorPerformingStores.map((store) => (
                        <div
                          key={store.id}
                          className="bg-red-50 p-4 rounded-lg border-2 border-red-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-red-900">
                              {store.name}
                            </h5>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold uppercase">
                              {store.performance}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-red-700 mb-2">
                                Critical Metrics:
                              </p>
                              <div className="text-xs text-red-800 space-y-1">
                                <p>
                                  📉 Revenue: ₹
                                  {store.totalRevenue.toLocaleString()} (Low)
                                </p>
                                <p>
                                  📦 Orders: {store.totalTransactions}{" "}
                                  (Critical)
                                </p>
                                <p>
                                  👥 Customers: {store.uniqueCustomers} (Low
                                  Base)
                                </p>
                                <p>
                                  ❌ Success Rate: {store.completionRate}%
                                  (Poor)
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-red-700 mb-2">
                                Urgent Action Items:
                              </p>
                              <div className="text-xs text-red-800 space-y-1">
                                {getStoreRecommendations(store).map(
                                  (rec, idx) => (
                                    <p key={idx}>{rec}</p>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overall Business Insights */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                      🧠 AI Business Insights
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <h5 className="font-bold text-blue-900 mb-2">
                          Market Opportunities
                        </h5>
                        <ul className="text-blue-800 space-y-1 text-xs">
                          <li>
                            • Total offline revenue: ₹
                            {storeAnalytics
                              .reduce(
                                (sum, store) => sum + store.totalRevenue,
                                0
                              )
                              .toLocaleString()}
                          </li>
                          <li>
                            • Average store performance gap:{" "}
                            {Math.round(
                              ((storeAnalytics[0]?.totalRevenue || 0) -
                                (storeAnalytics[storeAnalytics.length - 1]
                                  ?.totalRevenue || 0)) /
                                1000
                            )}
                            K
                          </li>
                          <li>
                            • Potential for{" "}
                            {Math.round(
                              ((storeAnalytics[0]?.avgOrderValue || 0) /
                                (storeAnalytics.reduce(
                                  (sum, s) => sum + s.avgOrderValue,
                                  0
                                ) /
                                  storeAnalytics.length) -
                                1) *
                                100
                            )}
                            % AOV improvement across stores
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-bold text-purple-900 mb-2">
                          Strategic Focus Areas
                        </h5>
                        <ul className="text-purple-800 space-y-1 text-xs">
                          <li>
                            • Standardize best practices from top performer
                          </li>
                          <li>
                            • Implement performance-based incentive programs
                          </li>
                          <li>
                            • Focus on customer acquisition for underperforming
                            stores
                          </li>
                          <li>
                            • Consider inventory optimization across locations
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 border border-amber-200 rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-800 to-amber-600 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">All Transactions</h3>
          </div>
        </div>
        <div className="p-6">
          <SortableTransactionTable storeId={storeId} />
        </div>
      </div>
      </div>
    </div>
  );
}
