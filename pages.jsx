import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import UserJourney from "./pages/UserJourney";
import StoreKeeper from "./pages/StoreKeeper";
import Admin from "./pages/Admin";

export default function Pages() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Agentic Dashboard
            </h1>
            <nav className="flex space-x-8">
              <Link
                to="/"
                className="text-slate-700 hover:text-indigo-600 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-indigo-50"
              >
                Home
              </Link>
              <Link
                to="/user"
                className="text-slate-700 hover:text-blue-600 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                User Journey
              </Link>
              <Link
                to="/store"
                className="text-slate-700 hover:text-emerald-600 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-emerald-50"
              >
                Store Keeper
              </Link>
              <Link
                to="/admin"
                className="text-slate-700 hover:text-slate-600 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<UserJourney />} />
          <Route path="/store" element={<StoreKeeper />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}
