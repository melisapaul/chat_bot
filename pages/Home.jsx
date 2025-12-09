import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Building, Settings } from "lucide-react";

export default function Home() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-200 rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Welcome to <span className="text-indigo-600">ABFRL</span>{" "}
              Dashboard
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Navigate through different user journeys to explore and analyze
              your data insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div
              onClick={() => nav("/user")}
              className="group cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                User Journey
              </h3>
              <p className="text-sm text-slate-600 mb-3 flex-grow">
                Track and analyze user interactions and behavior patterns
              </p>
              <div className="text-xs text-blue-500 font-medium group-hover:text-blue-600 transition-colors flex items-center">
                Click to explore <span className="ml-1">→</span>
              </div>
            </div>

            <div
              onClick={() => nav("/store")}
              className="group cursor-pointer bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Store Keeper
              </h3>
              <p className="text-sm text-slate-600 mb-3 flex-grow">
                Manage inventory, orders, and store operations efficiently
              </p>
              <div className="text-xs text-emerald-500 font-medium group-hover:text-emerald-600 transition-colors flex items-center">
                Click to explore <span className="ml-1">→</span>
              </div>
            </div>

            <div
              onClick={() => nav("/admin")}
              className="group cursor-pointer bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col"
            >
              <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-700 transition-colors">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Admin Panel
              </h3>
              <p className="text-sm text-slate-600 mb-3 flex-grow">
                Configure settings, manage users, and oversee operations
              </p>
              <div className="text-xs text-slate-500 font-medium group-hover:text-slate-600 transition-colors flex items-center">
                Click to explore <span className="ml-1">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
