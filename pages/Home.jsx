import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building, Settings, Sparkles } from "lucide-react";

export default function Home() {
  const nav = useNavigate();
  const [showInStoreLogin, setShowInStoreLogin] = useState(false);
  const [loginData, setLoginData] = useState({ sessionId: "", password: "" });

  const handleInStoreLogin = (e) => {
    e.preventDefault();
    // Redirect to in-store chatbot session
    nav("/instore-session");
  };

  const handleInputChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <img
              src="/images/abfrl-icon.png"
              alt="ABFRL Logo"
              className="h-24 w-auto object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent">
            Welcome to ABFRL Agentic Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Navigate through different user journeys to explore and analyze your
            data insights with powerful analytics and reporting tools
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* User Journey Card */}
          <div className="group bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:border-amber-300">
            <div className="bg-gradient-to-br from-red-800 to-amber-600 p-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                User Journey
              </h3>
              <div className="w-16 h-1 bg-white/30 rounded-full"></div>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6 leading-relaxed text-base">
                Track and analyze user interactions, behavior patterns, purchase
                history, and loyalty points in one comprehensive dashboard
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => nav("/user")}
                  className="bg-gradient-to-r from-red-800 to-amber-600 hover:from-red-900 hover:to-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 text-sm"
                >
                  <span>Online</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setShowInStoreLogin(true)}
                  className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 text-sm"
                >
                  <span>In-Store Kiosk</span>
                  <Building className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Store Keeper Card */}
          <div
            onClick={() => nav("/store")}
            className="group cursor-pointer bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:border-amber-300"
          >
            <div className="bg-gradient-to-br from-amber-600 to-yellow-500 p-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Store Keeper
              </h3>
              <div className="w-16 h-1 bg-white/30 rounded-full"></div>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6 leading-relaxed text-base">
                Manage inventory levels, track orders, monitor store operations,
                and analyze performance metrics efficiently
              </p>
              <div className="flex items-center text-amber-700 font-semibold group-hover:text-amber-800 transition-colors">
                <span>Manage Store</span>
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Admin Panel Card */}
          <div
            onClick={() => nav("/admin")}
            className="group cursor-pointer bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:border-red-300"
          >
            <div className="bg-gradient-to-br from-red-900 to-red-700 p-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Admin Panel
              </h3>
              <div className="w-16 h-1 bg-white/30 rounded-full"></div>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6 leading-relaxed text-base">
                Get insights into last month's revenue, transactions, customer
                growth, and store overview instantly in one dashboard
              </p>
              <div className="flex items-center text-red-800 font-semibold group-hover:text-red-900 transition-colors">
                <span>Open Admin</span>
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow-lg border border-gray-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600">
              System Status: All services operational
            </span>
          </div>
        </div>
      </div>

      {/* In-Store Login Modal */}
      {showInStoreLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-yellow-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      In-Store Login
                    </h3>
                    <p className="text-amber-100 text-sm">
                      Enter your session ID to continue
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInStoreLogin(false)}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleInStoreLogin} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gmail ID
                  </label>
                  <input
                    type="email"
                    name="sessionId"
                    value={loginData.sessionId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="Enter your Gmail ID (e.g., user@gmail.com)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="Enter any password"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInStoreLogin(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
