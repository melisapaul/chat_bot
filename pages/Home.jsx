import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Building, Settings, Sparkles } from "lucide-react";

export default function Home() {
  const nav = useNavigate();
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
          <div
            onClick={() => nav("/user")}
            className="group cursor-pointer bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:border-amber-300"
          >
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
              <div className="flex items-center text-red-800 font-semibold group-hover:text-amber-600 transition-colors">
                <span>Explore Journey</span>
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
                Get insights into last month's revenue, transactions, customer growth, and store overview instantly in one dashboard
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
    </div>
  );
}
