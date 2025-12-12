import React, { useState } from "react";
import MessengerChatbot from "../components/MessengerChatbot";
import { MessageCircle } from "lucide-react";

export default function ChatbotDemo() {
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Messenger-Style Chatbot Demo
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Features</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-500">✓</span>
              <span><strong>Panel Size:</strong> 380px width × 520px height</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">✓</span>
              <span><strong>Header:</strong> Sales Agent with Active status and Channel indicator (Web/Phone/Chat)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">✓</span>
              <span><strong>Message Bubbles:</strong> User messages (right, orange gradient) and Agent messages (left, white with border)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">✓</span>
              <span><strong>Quick Replies:</strong> Interactive buttons below agent messages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">✓</span>
              <span><strong>Input Area:</strong> Text input with mic icon and send button</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">✓</span>
              <span><strong>Channel Switcher:</strong> Dropdown to switch between Web, Phone, and Chat channels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">✓</span>
              <span><strong>Typing Indicator:</strong> Animated dots when agent is typing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">✓</span>
              <span><strong>Auto-scroll:</strong> Automatically scrolls to latest message</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Try it out!</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to open the messenger-style chatbot. The chatbot appears as a floating panel in the bottom-right corner.
          </p>
          <button
            onClick={() => setShowChatbot(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <MessageCircle size={20} />
            Open Chatbot
          </button>
        </div>

        <div className="mt-8 bg-orange-100 border border-orange-300 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-orange-900 mb-3">💡 Integration Tips</h3>
          <div className="text-sm text-orange-800 space-y-2">
            <p>• Import the MessengerChatbot component: <code className="bg-white px-2 py-1 rounded">import MessengerChatbot from "./components/MessengerChatbot"</code></p>
            <p>• Use state to control visibility: <code className="bg-white px-2 py-1 rounded">const [showChatbot, setShowChatbot] = useState(false)</code></p>
            <p>• Render conditionally: <code className="bg-white px-2 py-1 rounded">{`{showChatbot && <MessengerChatbot onClose={() => setShowChatbot(false)} />}`}</code></p>
            <p>• The chatbot is positioned fixed at bottom-right by default</p>
          </div>
        </div>
      </div>

      {/* Floating Chat Button (Alternative trigger) */}
      {!showChatbot && (
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center animate-bounce hover:animate-none z-40"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Messenger Chatbot */}
      {showChatbot && (
        <MessengerChatbot onClose={() => setShowChatbot(false)} />
      )}
    </div>
  );
}
