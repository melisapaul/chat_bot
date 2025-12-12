import React, { useState, useEffect, useRef } from "react";
import { Loader2, Mic, Send, Globe, Phone, MessageSquare, X } from "lucide-react";

export default function MessengerChatbot({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [channel, setChannel] = useState("web");
  const [isTyping, setIsTyping] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const messagesEndRef = useRef(null);
  const timelineEndRef = useRef(null);

  const channels = [
    { value: "web", label: "Web", icon: Globe },
    { value: "phone", label: "Phone", icon: Phone },
    { value: "chat", label: "Chat", icon: MessageSquare },
  ];

  useEffect(() => {
    // Initial greeting with agent logs
    addAgentLog("System", "SalesAgent", "Session initiated");
    addAgentMessage(
      "Hi! I'm your Sales Agent. What kind of product are you looking for today?",
      ["shirts under 3000", "Show me products", "Browse catalog"],
      { title: "Sales Agent", id: "sales_agent" }
    );
    addAgentLog("SalesAgent", "User", "Greeting sent, awaiting user query");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentLogs]);

  const addAgentLog = (from, to, message) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setAgentLogs((prev) => [...prev, { from, to, message, timestamp }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { type: "user", text, timestamp: new Date() }]);
  };

  const addAgentMessage = (text, quickReplies = [], agentInfo = null) => {
    setMessages((prev) => [...prev, { type: "agent", text, quickReplies, timestamp: new Date(), agentInfo }]);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addUserMessage(inputValue);
      setInputValue("");
      
      // Simulate agent response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        handleAgentResponse(inputValue);
      }, 1500);
    }
  };

  const handleAgentResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes("shirt") || lowerMsg.includes("clothing") || lowerMsg.includes("product")) {
      addAgentLog("SalesAgent", "RecommendationAgent", `find shirts price<=3000, color:any, query:"${userMessage}"`);
      setTimeout(() => {
        addAgentLog("RecommendationAgent", "Database", "Searching product catalog...");
      }, 300);
      setTimeout(() => {
        addAgentLog("Database", "RecommendationAgent", "3 SKUs found [SKU101:Louis Philippe, SKU205:Raymond, SKU333:Peter England]");
        addAgentLog("RecommendationAgent", "SalesAgent", "3 products matched, returning recommendations");
      }, 600);
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "Great! I found some premium shirts for you. Would you like to see them?",
          ["Show Products", "See More Options", "Check Availability"],
          { title: "Recommendation Agent", id: "recommendation_agent" }
        );
      }, 900);
    } else if (lowerMsg.includes("price") || lowerMsg.includes("cost")) {
      addAgentLog("SalesAgent", "RecommendationAgent", "Query price range for shirts");
      setTimeout(() => {
        addAgentLog("RecommendationAgent", "SalesAgent", "Price range: ₹1,699-₹2,850");
      }, 400);
      addAgentMessage(
        "Our shirts range from ₹1,699 to ₹2,850. Would you like to filter by price?",
        ["Under ₹2000", "₹2000-₹3000", "All Prices"],
        { title: "Recommendation Agent", id: "recommendation_agent" }
      );
    } else {
      addAgentLog("SalesAgent", "User", "Awaiting specific query");
      addAgentMessage(
        "I can help you find products, check inventory, or process orders. What would you like to do?",
        ["Browse Products", "Check Stock", "Track Order"],
        { title: "Recommendation Agent", id: "recommendation_agent" }
      );
    }
  };

  const handleQuickReply = (reply) => {
    addUserMessage(reply);
    setIsTyping(true);
    
    if (reply === "Show Products" || reply === "Show me products" || reply === "Browse catalog") {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      setTimeout(() => {
        addAgentLog("SalesAgent", "RecommendationAgent", "Fetch product details for matched SKUs");
        addAgentLog("RecommendationAgent", "ProductDB", "Query: SKU101, SKU205, SKU333");
      }, 400);
      setTimeout(() => {
        addAgentLog("ProductDB", "RecommendationAgent", "Details: 3 products with images, prices, descriptions");
        addAgentLog("RecommendationAgent", "SalesAgent", "Product cards ready for display");
        setIsTyping(false);
        // Show products as a special message type
        setMessages((prev) => [...prev, { 
          type: "products", 
          timestamp: new Date(),
          agentInfo: { title: "Recommendation Agent", id: "recommendation_agent" }
        }]);
      }, 1200);
    } else if (reply === "Check Availability" || reply.includes("Kolkata") || reply.includes("Mall")) {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      setTimeout(() => {
        addAgentLog("SalesAgent", "InventoryAgent", "check SKU101 near pin 700001");
        addAgentLog("InventoryAgent", "StoreDB", "Query stores in Kolkata region");
      }, 400);
      setTimeout(() => {
        addAgentLog("StoreDB", "InventoryAgent", "Found: 3 stores with stock data");
        addAgentLog("InventoryAgent", "SalesAgent", "SKU101 → City Centre (Available:5), South Mall (Limited:2), Online (12)");
        setIsTyping(false);
        addAgentMessage(
          "Checking inventory at nearby stores...",
          ["Kolkata City Centre", "South Mall Store", "Buy Online"],
          { title: "Inventory Agent", id: "inventory_agent" }
        );
      }, 1200);
    } else if (reply.includes("₹")) {
      addAgentLog("User", "SalesAgent", `Product selected: ${reply}`);
      setTimeout(() => {
        addAgentLog("SalesAgent", "PaymentAgent", "Initiate checkout flow");
        addAgentLog("PaymentAgent", "SalesAgent", "Payment options ready: UPI, Cards, COD");
        setIsTyping(false);
        addAgentMessage(
          "Great choice! How would you like to proceed?",
          ["Add to Cart", "Buy Now", "View Details"],
          { title: "Payment Agent", id: "payment_agent" }
        );
      }, 1200);
    } else {
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "Let me help you with that!",
          ["Continue", "Go Back"],
          { title: "Sales Agent", id: "sales_agent" }
        );
      }, 1200);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-orange-100 via-yellow-100 to-amber-100">
      <div className="h-screen flex">
        {/* LEFT - Agent Timeline */}
        <div className="w-1/3 bg-white border-r border-orange-300 flex flex-col shadow-lg">
          <header className="min-h-[20%] max-h-[20%] p-4 border-b border-orange-300 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-[2vw] font-bold text-white drop-shadow-md flex items-center">
                ⚡ Agent Timeline
              </h1>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-[1vw] text-orange-100 mt-2">Live Orchestration Log</p>
          </header>

          {/* Agent Timeline Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3 relative">
              {/* Vertical Timeline Line */}
              {agentLogs.length > 0 && (
                <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-gradient-to-b from-orange-500 to-amber-500" />
              )}

              {/* Sales Agent - Master Agent */}
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 h-3 w-3 bg-orange-500 rounded-full shadow-md"></div>
                <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg border border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-[1.3vw] text-gray-900">
                      Sales Agent
                    </p>
                    <span className="text-[0.8vw] bg-orange-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                      sales_agent
                    </span>
                  </div>
                  <p className="text-[0.85vw] text-gray-600 mb-2">Master Orchestrator</p>
                  
                  {/* Timeline logs for Sales Agent */}
                  <div className="mt-3 space-y-1 border-t border-orange-200 pt-2">
                    {agentLogs
                      .filter(log => log.from === 'SalesAgent' || log.to === 'SalesAgent' || log.from === 'System')
                      .slice(-3)
                      .map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[0.75vw] font-mono">
                          <span className="text-gray-400 min-w-[60px]">{log.timestamp}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-orange-600 font-semibold">{log.from}</span>
                            <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="text-orange-600 font-semibold">{log.to}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Recommendation Agent */}
              {agentLogs.some(log => log.from === 'RecommendationAgent' || log.to === 'RecommendationAgent') && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-amber-500 rounded-full shadow-md"></div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg border border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[1.3vw] text-gray-900">
                        Recommendation Agent
                      </p>
                      <span className="text-[0.8vw] bg-amber-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                        recommendation_agent
                      </span>
                    </div>
                    
                    {/* Timeline logs */}
                    <div className="mt-2 space-y-1 border-t border-orange-200 pt-2">
                      {agentLogs
                        .filter(log => log.from === 'RecommendationAgent' || log.to === 'RecommendationAgent')
                        .slice(-3)
                        .map((log, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[0.75vw] font-mono">
                            <span className="text-gray-400 min-w-[60px]">{log.timestamp}</span>
                            <div className="flex-1 text-gray-700">{log.message}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Agent */}
              {agentLogs.some(log => log.from === 'InventoryAgent' || log.to === 'InventoryAgent') && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-green-500 rounded-full shadow-md"></div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg border border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[1.3vw] text-gray-900">
                        Inventory Agent
                      </p>
                      <span className="text-[0.8vw] bg-green-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                        inventory_agent
                      </span>
                    </div>
                    
                    {/* Timeline logs */}
                    <div className="mt-2 space-y-1 border-t border-orange-200 pt-2">
                      {agentLogs
                        .filter(log => log.from === 'InventoryAgent' || log.to === 'InventoryAgent' || log.from === 'StoreDB' || log.to === 'StoreDB')
                        .slice(-3)
                        .map((log, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[0.75vw] font-mono">
                            <span className="text-gray-400 min-w-[60px]">{log.timestamp}</span>
                            <div className="flex-1 text-gray-700">{log.message}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Agent */}
              {agentLogs.some(log => log.from === 'PaymentAgent' || log.to === 'PaymentAgent') && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-red-500 rounded-full shadow-md"></div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg border border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[1.3vw] text-gray-900">
                        Payment Agent
                      </p>
                      <span className="text-[0.8vw] bg-red-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                        payment_agent
                      </span>
                    </div>
                    
                    {/* Timeline logs */}
                    <div className="mt-2 space-y-1 border-t border-orange-200 pt-2">
                      {agentLogs
                        .filter(log => log.from === 'PaymentAgent' || log.to === 'PaymentAgent')
                        .slice(-3)
                        .map((log, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[0.75vw] font-mono">
                            <span className="text-gray-400 min-w-[60px]">{log.timestamp}</span>
                            <div className="flex-1 text-gray-700">{log.message}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
              
              {isTyping && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-amber-500 rounded-full animate-pulse shadow-md"></div>
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-400 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                      <p className="text-orange-600 text-[1vw] font-semibold">
                        {agentLogs.length > 0 ? agentLogs[agentLogs.length - 1].message : 'Agent Processing...'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={timelineEndRef} />
            </div>
          </div>
        </div>

        {/* RIGHT - Messenger Chat */}
        <div className="w-2/3 flex flex-col bg-white"
      >
        {/* Header */}
        <header className="min-h-[20%] max-h-[20%] p-4 border-b border-orange-300 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-3xl">🤖</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-[2vw] font-bold text-white drop-shadow-md flex items-center">
                AI Orchestrator
              </h1>
              <div className="flex items-center gap-3 text-[1vw] text-orange-100 mt-1">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Active</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {React.createElement(channels.find(c => c.value === channel)?.icon || Globe, { size: 14 })}
                  <span>Channel: {channels.find(c => c.value === channel)?.label}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-orange-50/30 to-white">
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.type === "user" ? (
                // User Message (Right)
                <div className="flex justify-end">
                  <div className="max-w-[70%]">
                    <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md">
                      <p className="text-[1vw]">{msg.text}</p>
                    </div>
                    <p className="text-[0.8vw] text-gray-400 mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ) : msg.type === "products" ? (
                // Product Cards with Conversational Message
                <div className="flex justify-start">
                  <div className="max-w-[95%] w-full">
                    <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm p-5 shadow-md">
                      {/* Agent header */}
                      <div className="text-[0.75vw] text-gray-500 mb-3 font-medium">
                        {msg.agentInfo?.title || "Recommendation Agent"} • {msg.agentInfo?.id || "recommendation_agent"}
                      </div>
                      
                      {/* Conversational message */}
                      <div className="text-gray-800 mb-4 text-[1vw] leading-relaxed">
                        I recommend these shirts based on your past buys (Raymond last month). Raymond Shirt is ₹1,789 and trending — want me to check size 40 availability?
                      </div>
                      
                      {/* Product cards */}
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { name: "Louis Philippe", price: "₹2,199", img: "/images/Louis Philippe Shirt.avif" },
                          { name: "Raymond", price: "₹1,789", img: "/images/shirt 2.avif", trending: true },
                          { name: "Peter England", price: "₹2,850", img: "/images/shirt 4.avif" }
                        ].map((product, pIdx) => (
                          <div key={pIdx} className="bg-gradient-to-b from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100 shadow-sm hover:shadow-md transition-all">
                            <img 
                              src={product.img} 
                              alt={product.name}
                              className="w-full h-36 object-cover rounded-lg mb-2"
                            />
                            <div className="text-[0.9vw] font-semibold text-gray-800 mb-1">
                              {product.name}
                              {product.trending && (
                                <span className="ml-1.5 text-[0.7vw] bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                  🔥 Trending
                                </span>
                              )}
                            </div>
                            <div className="text-[1vw] font-bold text-orange-600 mb-3">{product.price}</div>
                            
                            {/* CTA Buttons */}
                            <div className="flex flex-col gap-2">
                              <button className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-[0.8vw] font-medium transition-all shadow-sm hover:shadow-md">
                                Check Availability
                              </button>
                              <button className="w-full px-3 py-2 bg-white hover:bg-orange-50 text-orange-600 border-2 border-orange-500 rounded-lg text-[0.8vw] font-medium transition-all hover:scale-[1.02]">
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[0.8vw] text-gray-400 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ) : (
                // Agent Message (Left)
                <div className="flex justify-start">
                  <div className="max-w-[70%]">
                    <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm px-5 py-3 shadow-md">
                      <p className="text-[1vw] text-gray-800">{msg.text}</p>
                    </div>
                    <p className="text-[0.8vw] text-gray-400 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    
                    {/* Quick Replies */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.quickReplies.map((reply, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickReply(reply)}
                            className="bg-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 hover:text-white border-2 border-orange-300 text-orange-600 px-4 py-2 rounded-full text-[0.9vw] font-medium transition-all shadow-sm hover:shadow-md hover:scale-105"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-orange-200 bg-white p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 flex items-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl px-5 py-3 border-2 border-orange-300 focus-within:border-orange-500 transition-all shadow-sm">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 bg-transparent outline-none text-[1vw] text-gray-800 placeholder-gray-500"
              />
              <button
                className="text-orange-500 hover:text-orange-600 transition-colors ml-2"
                onClick={() => {/* Voice input handler */}}
                title="Voice input"
              >
                <Mic size={22} />
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl p-3 transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed hover:scale-105"
              title="Send message"
            >
              <Send size={22} />
            </button>
          </div>
          
          {/* Channel Switcher */}
          <div className="flex items-center gap-3 bg-orange-50 rounded-lg p-2 border border-orange-200">
            <span className="text-[0.9vw] text-gray-600 font-medium">Channel:</span>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="flex-1 text-[0.9vw] bg-white border border-orange-300 rounded-lg px-3 py-2 outline-none focus:border-orange-500 text-gray-700 cursor-pointer font-medium shadow-sm hover:shadow transition-all"
            >
              {channels.map((ch) => (
                <option key={ch.value} value={ch.value}>
                  {ch.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
