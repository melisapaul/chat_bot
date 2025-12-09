import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Pages from "./pages.jsx";
import { BrowserRouter } from "react-router-dom";
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      {/* Floating Icon with Tooltip */}
      <div className="fixed bottom-3 right-3">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
            interact with me
            {/* Arrow pointing down */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => setOpen(!open)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-4xl hover:bg-blue-700 transition-all duration-300 hover:scale-110"
        >
          🤖
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-3 w-[100%] h-[650px] bg-[#0d0d0d] text-gray-200 font-sans text-[1.4vw] rounded-2xl shadow-2xl border border-gray-300 overflow-hidden animate-fade-in">
          <App />
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Pages />
      <ChatWidget />
    </BrowserRouter>
  </React.StrictMode>
);
