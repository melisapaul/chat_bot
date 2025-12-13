import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Phone,
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Loader2,
} from "lucide-react";

export default function InStoreChatbot({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [channel, setChannel] = useState("web");
  const [isTyping, setIsTyping] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [log, setLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const messagesEndRef = useRef(null);
  const timelineEndRef = useRef(null);
  const hasInitialized = useRef(false);

  const channels = [
    { value: "web", label: "Web", icon: Globe },
    { value: "phone", label: "Phone", icon: Phone },
    { value: "chat", label: "Chat", icon: MessageSquare },
  ];

  useEffect(() => {
    if (!hasInitialized.current) {
      setIsLoading(true);
      setLoadingMessage("Restoring customer session from online channel...");

      // Initialize with welcome back message
      setTimeout(() => {
        setLoadingMessage(
          "Retrieving customer data for session #SESSION789456..."
        );
      }, 500);

      setTimeout(() => {
        setLoadingMessage(
          "Loading product details and customer information..."
        );
      }, 1000);

      setTimeout(() => {
        setIsLoading(false);
        addAgentMessage(
          "Welcome back, Arjun! 👋\n\n🆔 Your Session ID: #SESSION789456\n\n📦 PRODUCT DETAILS:\n▸ Product: Louis Philippe\n▸ Size: 40 (Medium)\n▸ Color: White\n▸ Price: ₹2,199\n\n✅ Your session has been successfully restored from online to in-store. How can I assist you today?"
        );
      }, 1800);

      hasInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentLogs]);

  const addAgentLog = (from, to, message) => {
    setAgentLogs((prev) => [
      ...prev,
      { from, to, message, timestamp: new Date() },
    ]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text,
        timestamp: new Date(),
      },
    ]);
  };

  const addAgentMessage = (
    text,
    quickReplies = [],
    agentInfo = null,
    messageType = "agent"
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        type: messageType,
        text,
        quickReplies,
        agentInfo,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      handleQuickReply(inputValue);
      setInputValue("");
    }
  };

  const handleQuickReply = (reply) => {
    addUserMessage(reply);
    setIsTyping(true);
    setIsLoading(true);

    if (reply === "Continue Shopping") {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      setLoadingMessage("Connecting to inventory system...");

      setTimeout(() => {
        addAgentLog(
          "SalesAgent",
          "InventoryAgent",
          "Show available products for in-store browsing"
        );
        setLog((prev) => [
          ...prev,
          {
            agentId: "inventory_agent",
            title: "Inventory Agent",
            action: "Fetching in-store product catalog",
          },
        ]);
        setIsTyping(false);
        setIsLoading(false);
        addAgentMessage(
          "Great! Let me show you some products available in our store:\n\n🛍️ RECOMMENDED FOR YOU:\n\n1️⃣ Van Heusen Blazer - ₹3,499\n2️⃣ Adidas Track Pants - ₹2,299  \n3️⃣ Peter England Shirt - ₹1,899\n\nWhich category would you like to explore?",
          [
            "Formal Wear",
            "Casual Wear",
            "Sports Wear",
            "View Your Selected Item",
          ],
          { title: "Inventory Agent", id: "inventory_agent" }
        );
      }, 1500);
    } else if (reply === "Check Product Availability") {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      setLoadingMessage("Checking inventory for Louis Philippe...");

      setTimeout(() => {
        addAgentLog(
          "SalesAgent",
          "InventoryAgent",
          "Check Louis Philippe stock in current store"
        );
        addAgentLog(
          "InventoryAgent",
          "StoreDB",
          "Query ABFRL South City inventory"
        );
        setLoadingMessage("Verifying stock levels...");
      }, 500);

      setTimeout(() => {
        addAgentLog(
          "StoreDB",
          "InventoryAgent",
          "Louis Philippe Size 40: Available (2 pieces)"
        );
        addAgentLog(
          "InventoryAgent",
          "SalesAgent",
          "Stock confirmed - ready for physical inspection"
        );
        setLog((prev) => [
          ...prev,
          {
            agentId: "inventory_agent",
            title: "Inventory Agent",
            action: "Stock verification completed",
          },
        ]);
        setIsTyping(false);
        setIsLoading(false);
        addAgentMessage(
          "✅ STOCK STATUS:\n\n📦 Louis Philippe (Size 40)\n🏪 Store: ABFRL South City\n📊 Available: 2 pieces in stock\n👤 Manager: Sophia\n\n🔍 Would you like to see the actual product or need any assistance?",
          [
            "Show Me the Product",
            "Try Different Size",
            "Complete Purchase",
            "Speak with Manager",
          ],
          { title: "Inventory Agent", id: "inventory_agent" }
        );
      }, 2000);
    } else if (reply === "Speak with Store Manager") {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      setLoadingMessage("Connecting you with store manager...");

      setTimeout(() => {
        addAgentLog(
          "SalesAgent",
          "StoreManager",
          "Customer requesting manager assistance"
        );
        addAgentLog(
          "StoreManager",
          "SalesAgent",
          "Manager Sophia will assist the customer"
        );
        setLog((prev) => [
          ...prev,
          {
            agentId: "store_manager",
            title: "Store Manager",
            action: "Personal customer assistance",
          },
        ]);
        setIsTyping(false);
        setIsLoading(false);
        addAgentMessage(
          "👩‍💼 STORE MANAGER ASSISTANCE\n\n Hello Arjun! I'm Sophia, the Store Manager at ABFRL South City.\n\n🆔 Your Session: #SESSION789456\n📋 I can see you're interested in the Louis Philippe shirt.\n\n✨ How can I personally assist you today?",
          [
            "Product Quality Questions",
            "Size & Fit Guidance",
            "Special Offers",
            "Exchange Policy",
          ],
          { title: "Store Manager (Sophia)", id: "store_manager" }
        );
      }, 1800);
    } else if (reply === "Complete Purchase") {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      setLoadingMessage("Initiating in-store payment process...");

      setTimeout(() => {
        addAgentLog(
          "SalesAgent",
          "PaymentAgent",
          "Initiate in-store purchase for Louis Philippe"
        );
        addAgentLog("PaymentAgent", "POS-System", "Process payment for ₹2,199");
        setLog((prev) => [
          ...prev,
          {
            agentId: "payment_agent",
            title: "Payment Agent",
            action: "Processing in-store transaction",
          },
        ]);
        setIsTyping(false);
        setIsLoading(false);
        addAgentMessage(
          "💳 IN-STORE PAYMENT\n\n🛍️ Item: Louis Philippe Shirt\n💰 Amount: ₹2,199\n🆔 Session: #SESSION789456\n\n🏪 Please proceed to the counter for payment.\nChoose your preferred payment method:",
          ["Cash Payment", "Card Payment", "UPI Payment", "Back to Browsing"],
          { title: "Payment Agent", id: "payment_agent" }
        );
      }, 1500);
    } else if (reply === "Show Me the Product") {
      addAgentLog("User", "InventoryAgent", `Selected: ${reply}`);
      setLoadingMessage("Locating product for demonstration...");

      setTimeout(() => {
        addAgentLog(
          "InventoryAgent",
          "StoreStaff",
          "Customer wants to see Louis Philippe shirt"
        );
        addAgentLog(
          "StoreStaff",
          "InventoryAgent",
          "Bringing product to customer location"
        );
        setLog((prev) => [
          ...prev,
          {
            agentId: "store_staff",
            title: "Store Staff",
            action: "Product presentation service",
          },
        ]);
        setIsTyping(false);
        setIsLoading(false);
        addAgentMessage(
          "🛍️ PRODUCT PRESENTATION\n\n✨ Our store staff is bringing the Louis Philippe shirt to you!\n\n📍 Location: Trial Room Area\n👕 Product: White Formal Shirt, Size 40\n🏷️ Features: Premium cotton, wrinkle-free\n\n🔄 What would you like to do?",
          [
            "Try It On",
            "Check Fabric Quality",
            "See Other Colors",
            "Purchase This One",
          ],
          { title: "Store Staff", id: "store_staff" }
        );
      }, 2000);
    } else if (
      reply === "Cash Payment" ||
      reply === "Card Payment" ||
      reply === "UPI Payment"
    ) {
      addAgentLog("User", "PaymentAgent", `Selected payment: ${reply}`);
      setLoadingMessage(`Processing ${reply}...`);

      setTimeout(() => {
        addAgentLog(
          "PaymentAgent",
          "POS-System",
          `Processing ${reply} for ₹2,199`
        );
        addAgentLog(
          "POS-System",
          "PaymentAgent",
          "Payment successful - generating receipt"
        );
        setLog((prev) => [
          ...prev,
          {
            agentId: "fulfillment_agent",
            title: "Fulfillment Agent",
            action: "Transaction completion",
          },
        ]);
        setIsTyping(false);
        setIsLoading(false);
        addAgentMessage(
          "✅ PAYMENT SUCCESSFUL!\n\n🧾 Receipt: #RCP789456\n💳 Method: " +
            reply +
            "\n💰 Amount: ₹2,199\n🛍️ Product: Louis Philippe Shirt\n\n📦 Your purchase is complete! Thank you for shopping with ABFRL.\n\nWould you like a digital receipt?",
          [
            "Send Digital Receipt",
            "Print Receipt",
            "Continue Shopping",
            "Exit Store",
          ],
          { title: "POS System", id: "pos_system" }
        );
      }, 2500);
    } else {
      // Handle other replies
      setTimeout(() => {
        setIsTyping(false);
        setIsLoading(false);
        addAgentMessage(
          "I understand. Is there anything else I can help you with regarding your session or product inquiry?",
          [
            "Check Other Products",
            "Speak with Manager",
            "Complete Purchase",
            "Exit",
          ],
          { title: "Sales Agent", id: "sales_agent" }
        );
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackButton = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="h-screen top_section flex bg-gradient-to-br from-orange-100 via-yellow-100 to-amber-100 text-gray-800 font-sans text-[1.4vw] leading-[1.8vh]">
      {/* LEFT - Agent Timeline */}
      <div className="w-1/3 bottom_section overflow-y-auto border-r border-orange-300 bg-white shadow-lg">
        <header className="left_scroll min-h-[20%] max-h-[20%] p-4 border-b border-orange-300 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 flex justify-between items-center shadow-lg">
          <div>
            <h1 className="text-[2vw] font-bold flex items-center text-white drop-shadow-md">
              ⚡ Agent Timeline
            </h1>
            <p className="text-[1vw] text-orange-100 mt-2">
              Live Orchestration Log
            </p>
          </div>
          <button
            onClick={handleBackButton}
            className="bg-gradient-to-r from-red-800 to-amber-600 hover:from-red-900 hover:to-amber-700 text-white px-4 py-2 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
        </header>

        <div className="p-4">
          {log.length === 0 && !isLoading && (
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-300 text-gray-700 text-[1vw] shadow-sm">
              Waiting to start in-store journey...
            </div>
          )}

          {isLoading && (
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-400 text-orange-700 text-[1vw] animate-pulse shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                <span>Processing...</span>
              </div>
              <p className="text-[0.9vw] text-gray-700">{loadingMessage}</p>
            </div>
          )}

          <div className="space-y-3 relative pl-2 h-500 overflow-y-auto ds">
            {(log.length > 0 || isLoading) && (
              <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-gradient-to-b from-orange-500 to-amber-500" />
            )}

            {log.map((a, i) => (
              <div key={i} className="relative pl-8">
                <div className="absolute left-0 top-1 h-3 w-3 bg-orange-500 rounded-full shadow-md"></div>
                <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg border border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between">
                    <p className="font-bold text-[1.3vw] text-gray-900">
                      {a.title}
                    </p>
                    <span className="text-[0.8vw] bg-orange-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                      {a.agentId}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 h-3 w-3 bg-amber-500 rounded-full animate-pulse shadow-md"></div>
                <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-400 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                    <p className="text-orange-600 text-[1vw] font-semibold">
                      {loadingMessage || "Agent Processing..."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={timelineEndRef} />
          </div>
        </div>
      </div>

      {/* RIGHT - Chat Interface */}
      <div className="bottom_section w-2/3 flex flex-col bg-white">
        <header className="min-h-[20%] max-h-[20%] p-4 border-b border-orange-300 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 flex justify-between items-center shadow-lg">
          <div>
            <h1 className="text-[2vw] font-bold flex items-center text-white drop-shadow-md">
              🤖 AI Orchestrator
            </h1>
            <p className="text-[1vw] text-orange-100 mt-2">
              In-store multi-agent automation
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Channel Selector */}
            <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-1 border border-orange-200">
              {channels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.value}
                    onClick={() => setChannel(ch.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-[0.9vw] transition-all ${
                      channel === ch.value
                        ? "bg-white text-orange-600 shadow-sm font-bold"
                        : "text-white hover:bg-white/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {ch.label}
                  </button>
                );
              })}
            </div>

            <div className="text-[1vw] bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg border border-orange-200 shadow-md">
              Status: <span className="text-white font-bold">Active</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close Chat"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col justify-center items-center text-gray-700">
              <span className="text-[8vw]">🏪</span>
              <p className="text-[1.5vw] font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent text-center">
                In-Store Assistant Ready!
              </p>
              <p className="text-[1vw] text-gray-600 mt-2 text-center">
                Your session is being restored...
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-2 rounded-xl border border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in"
            >
              <div className="flex items-center mb-2 border-b border-orange-200 pb-1">
                <div className="h-10 w-10 rounded-lg flex justify-center items-center bg-gradient-to-br from-orange-500 to-amber-500 mr-3 shadow-md">
                  <span className="text-white text-lg">💬</span>
                </div>
                <h3 className="font-bold text-[1.4vw] text-gray-900">
                  {msg.agentInfo ? msg.agentInfo.title : "In-Store Assistant"}
                </h3>
              </div>

              {msg.type === "user" ? (
                <div className="pl-8 mb-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg inline-block max-w-[80%]">
                    <p className="text-[1.1vw]">{msg.text}</p>
                  </div>
                </div>
              ) : (
                <div className="pl-8 mb-2">
                  <p className="text-gray-800 mb-2 text-[1.1vw] leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>

                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.quickReplies.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickReply(reply)}
                          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-3 py-1 rounded-full text-[0.9vw] font-medium transition-all hover:scale-105 shadow-md"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-2 rounded-xl border border-orange-200 shadow-lg animate-fade-in">
              <div className="flex items-center mb-2 border-b border-orange-200 pb-1">
                <div className="h-10 w-10 rounded-lg flex justify-center items-center bg-gradient-to-br from-orange-500 to-amber-500 mr-3 shadow-md">
                  <span className="text-white text-lg">💬</span>
                </div>
                <h3 className="font-bold text-[1.4vw] text-gray-900">
                  Assistant
                </h3>
              </div>
              <div className="pl-8 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-[1vw] text-gray-600">
                  Agent is preparing response...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-2 border-t border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-2 bg-white border border-orange-200 rounded-l text-gray-800 placeholder-gray-500 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-4 py-2 rounded-r font-bold transition-all disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
