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
  const purchaseModeData = Object.entries(
    data.transactions.reduce((acc, trans) => {
      acc[trans.mode] = (acc[trans.mode] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ["#0088FE", "#00C49F"]; // Blue for Online, Green for Offline

  // --- 2. Data Processing for On Store Tables ---

  const storePurchases = Object.entries(
    data.transactions
      .filter((t) => t.mode === "Offline" && t.storeId)
      .reduce((acc, trans) => {
        acc[trans.storeId] = (acc[trans.storeId] || 0) + 1;
        return acc;
      }, {})
  ).map(([storeId, count]) => ({ storeId, count }));

  // --- 3. Data Processing for Transactions: Month wise ---
  const monthlyTransactions = data.transactions.reduce((acc, trans) => {
    if (!acc[trans.month]) {
      acc[trans.month] = { name: trans.month, Online: 0, Offline: 0 };
    }
    acc[trans.month][trans.mode] += 1; // Count transactions, not amount
    return acc;
  }, {});

  const monthlyData = Object.values(monthlyTransactions).sort(
    (a, b) => new Date(`1 ${a.name} 2023`) - new Date(`1 ${b.name} 2023`)
  );
  const storeId = "";

  const getStoreNameById = (id) => {
    const store = data.storeKeepers.find((item) => item.id == id);
    return store ? store.store_name : "Unknown Store";
  };

  // Advanced Store Performance Analytics
  const storeAnalytics = useMemo(() => {
    const storeStats = {};

    // Initialize store stats
    data.storeKeepers.forEach((store) => {
      storeStats[store.id] = {
        id: store.id,
        name: store.store_name,
        manager: store.name,
        totalRevenue: 0,
        totalTransactions: 0,
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
          store.totalTransactions++;
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

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 text-gray-800 font-sans text-[1.4vw] rounded-xl shadow p-6 w-full min-w-full">
      <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>

      {/* Totals Grid (Existing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Users</div>
          <div className="text-2xl font-bold">{totals.users}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Products</div>
          <div className="text-2xl font-bold">{totals.products}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Store Keepers</div>
          <div className="text-2xl font-bold">{totals.storeKeepers}</div>
        </div>
      </div>

      {/* New Row for Pie Chart and Store Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 1. Total Purchased Online | Offline Pie Chart */}
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-3">Purchases: Online vs Offline</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={purchaseModeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {purchaseModeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. On Store Tables */}
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-3">Offline Purchases per Store</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="pb-2">Store Name</th>
                <th className="pb-2">Purchases Count</th>
              </tr>
            </thead>
            <tbody>
              {storePurchases.map((store, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{getStoreNameById(store.storeId)}</td>
                  <td className="py-2">{store.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Row for Monthly Transactions Chart */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* 3. Transactions : Month wise | Mode online or instore kyiosk */}
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-3">Monthly Transaction Modes</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Online" stackId="a" fill="#0088FE" />
                <Bar dataKey="Offline" stackId="a" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Highlights and Recommendation Section */}
      <div className="mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Highlights and Recommendation
          </h3>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setIsHighlightsOpen(!isHighlightsOpen)}
              className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-50 transition-colors rounded-xl"
            >
              <span className="text-base font-medium text-slate-700">
                View AI Insights
              </span>
              {isHighlightsOpen ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {isHighlightsOpen && (
              <div className="border-t border-slate-200">
                <div className="p-6 space-y-8">
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

                  {/* Strategic Recommendations */}
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Strategic Recommendations
                    </h4>
                    <div className="space-y-4">
                      {storeAnalytics.map((store) => (
                        <div
                          key={store.id}
                          className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-slate-800">
                              {store.name}
                            </h5>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                store.performance === "excellent"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : store.performance === "good"
                                  ? "bg-blue-100 text-blue-800"
                                  : store.performance === "average"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {store.performance.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-slate-600 mb-2">
                                Key Metrics:
                              </p>
                              <div className="text-xs text-slate-700 space-y-1">
                                <p>
                                  📈 Revenue: ₹
                                  {store.totalRevenue.toLocaleString()}
                                </p>
                                <p>📦 Orders: {store.totalTransactions}</p>
                                <p>👥 Customers: {store.uniqueCustomers}</p>
                                <p>
                                  ✅ Success Rate:{" "}
                                  {Math.round(store.completionRate)}%
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-600 mb-2">
                                Action Items:
                              </p>
                              <div className="text-xs text-slate-700 space-y-1">
                                {getStoreRecommendations(store)
                                  .slice(0, 3)
                                  .map((rec, idx) => (
                                    <p key={idx}>{rec}</p>
                                  ))}
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
      </div>

      {/* Original Existing Components */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-3">Transactions</h3>
          {/* ... existing table code ... */}
          <div className="mt-8">
            <SortableTransactionTable storeId={storeId} />
          </div>
        </div>
      </div>
    </div>
  );
}
