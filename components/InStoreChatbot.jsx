import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Phone,
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Loader2,
  Store,
} from "lucide-react";

export default function InStoreChatbot({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [channel, setChannel] = useState("kiosk");
  const [isTyping, setIsTyping] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [log, setLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const messagesEndRef = useRef(null);
  const timelineEndRef = useRef(null);
  const hasInitialized = useRef(false);
  const paymentFlowStartedRef = useRef(false);
  const paymentTimeoutsRef = useRef([]);

  const clearPaymentTimeouts = () => {
    for (const timeoutId of paymentTimeoutsRef.current) {
      clearTimeout(timeoutId);
    }
    paymentTimeoutsRef.current = [];
  };

  const channels = [
    { value: "kiosk", label: "In-Store Kiosk", icon: Store },
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
          "Welcome back, Arjun! 👋\n\n🆔 Your Session ID: #SESSION789456\n\n📦 PRODUCT DETAILS:\n▸ Product: Louis Philippe\n▸ Size: 40 (Medium)\n▸ Color: White\n▸ Price: ₹2,199\n\n✅ Your session has been successfully restored from online to in-store. How can I assist you today? You can type 'proceed' to complete the purchase, or 'continue shopping' to browse more products.",
          [],
          { title: "Sales Agent", id: "sales_agent" }
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
    const lowerReply = String(reply || "").toLowerCase();
    const isPaymentCompletion =
      reply === "Payment Completed" ||
      reply === "Cash Payment" ||
      reply === "Card Payment" ||
      reply === "UPI Payment" ||
      lowerReply.includes("payment completed");

    // Prevent double-triggering the payment completion flow (e.g., double-click)
    if (isPaymentCompletion && paymentFlowStartedRef.current) {
      return;
    }

    addUserMessage(reply);
    setIsTyping(true);
    setIsLoading(true);

    // Payment completion (must be checked BEFORE generic "payment" keyword routing)
    if (isPaymentCompletion) {
      paymentFlowStartedRef.current = true;
      clearPaymentTimeouts();

      addAgentLog(
        "User",
        "PaymentAgent",
        `Payment completed via ${selectedPaymentMethod || reply}`
      );
      setIsTyping(true);
      setIsLoading(true);
      setLoadingMessage(`Processing payment...`);

      paymentTimeoutsRef.current.push(
        setTimeout(() => {
          addAgentLog("PaymentAgent", "POS-System", `Verify payment status`);
          addAgentLog(
            "POS-System",
            "PaymentAgent",
            `Payment verified: ₹2,199 received`
          );
          addAgentLog(
            "PaymentAgent",
            "FulfillmentAgent",
            "Order confirmed - prepare for dispatch"
          );
        }, 1000)
      );

      paymentTimeoutsRef.current.push(
        setTimeout(() => {
          setLog((prev) => [
            ...prev,
            {
              agentId: "fulfillment_agent",
              title: "Fulfillment Agent",
              action: "Order confirmed - processing loyalty rewards",
            },
          ]);

          addAgentLog(
            "FulfillmentAgent",
            "FulfillmentAgent",
            "Order confirmed - prepare for dispatch"
          );
          addAgentLog(
            "FulfillmentAgent",
            "LoyaltyAgent",
            "Order completed - processing loyalty rewards"
          );
        }, 2000)
      );

      paymentTimeoutsRef.current.push(
        setTimeout(() => {
          setIsTyping(false);
          setIsLoading(false);
          addAgentMessage(
            "🎉 PAYMENT SUCCESSFUL!\n\n🧾 Receipt: #RCP789456\n💳 Method: " +
              (selectedPaymentMethod || reply) +
              "\n💰 Amount: ₹2,199\n🛍️ Product: Louis Philippe Shirt\n🆔 Session: #SESSION789456\n\n📦 Your purchase is complete! Thank you for shopping with ABFRL.",
            [],
            { title: "Fulfillment Agent", id: "fulfillment_agent" }
          );
        }, 2500)
      );

      // Loyalty Agent activation
      paymentTimeoutsRef.current.push(
        setTimeout(() => {
          addAgentLog(
            "LoyaltyAgent",
            "RewardsDB",
            "Calculate loyalty points for order #RCP789456"
          );

          setLog((prev) => [
            ...prev,
            {
              agentId: "loyalty_agent",
              title: "Loyalty Agent",
              action:
                "Points earned: 120 | Available coupons: 2 | Tier status updated",
            },
          ]);
        }, 3200)
      );

      paymentTimeoutsRef.current.push(
        setTimeout(() => {
          addAgentLog(
            "RewardsDB",
            "LoyaltyAgent",
            "Points earned: 120 | Available coupons: 2 | Tier status updated"
          );
          addAgentLog(
            "LoyaltyAgent",
            "User",
            "Rewards processed and applied to account"
          );

          setIsTyping(true);
        }, 4000)
      );

      paymentTimeoutsRef.current.push(
        setTimeout(() => {
          setIsTyping(false);
          addAgentMessage(
            "🎁 Loyalty Rewards Applied!\n\nYour rewards have been processed and applied\n\n🏆 Loyalty Benefits Applied:\n\n✅ Loyalty Points Earned\n+120 points added to your account\n120 pts\n\n🎟️ Coupon Applied\nFIRST10 - 10% discount applied\n-₹120\n\n🎯 Personalized Offer\nFree delivery on next 3 orders\nUnlocked",
            ["View Rewards", "Continue Shopping", "Exit Store"],
            { title: "Loyalty Agent", id: "loyalty_agent" },
            "loyalty"
          );
        }, 5200)
      );
    }
    // Handle payment/purchase related queries
    else if (
      lowerReply.includes("proceed") ||
      lowerReply.includes("complete purchase") ||
      lowerReply.includes("buy") ||
      lowerReply.includes("purchase") ||
      lowerReply.includes("payment") ||
      lowerReply.includes("pay now") ||
      lowerReply.includes("checkout")
    ) {
      addAgentLog("User", "SalesAgent", `Customer wants to proceed with purchase`);
      setIsTyping(true);
      setIsLoading(true);
      setLoadingMessage("Initiating in-store payment process...");

      // Starting a new payment attempt should allow completion again
      paymentFlowStartedRef.current = false;
      clearPaymentTimeouts();

      setTimeout(() => {
        addAgentLog(
          "SalesAgent",
          "PaymentAgent",
          "Initiate in-store purchase for Louis Philippe"
        );
        addAgentLog("PaymentAgent", "POS-System", "Display payment method options");
        
        // Only add to log if not already present
        setLog((prev) => {
          const hasPaymentAgent = prev.some(item => item.agentId === "payment_agent");
          if (hasPaymentAgent) return prev;
          return [
            ...prev,
            {
              agentId: "payment_agent",
              title: "Payment Agent",
              action: "Payment method selection and processing",
            },
          ];
        });
        
        setIsTyping(false);
        setIsLoading(false);
        setSelectedPaymentMethod(null); // Reset payment method
        addAgentMessage(
          "Great! Let's complete your purchase at the in-store counter.\n\n🛍️ Product: Louis Philippe Shirt\n💰 Amount: ₹2,199\n🆔 Session: #SESSION789456\n\nPlease choose your preferred payment method:",
          [],
          { title: "Payment Agent", id: "payment_agent" },
          "payment"
        );
      }, 2500);
    } else if (
      lowerReply.includes("continue shopping") ||
      lowerReply.includes("browse") ||
      lowerReply.includes("look around") ||
      lowerReply.includes("see more") ||
      reply === "Continue Shopping"
    ) {
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

          <div className="space-y-4 relative pl-2 h-500 overflow-y-auto ds">
            {(log.length > 0 || isLoading) && (
              <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-gradient-to-b from-orange-500 to-amber-500" />
            )}

            {/* Agent Cards with embedded logs */}
            {log.map((a, i) => {
              // Get logs related to this agent
              const agentName = a.title.replace(' Agent', 'Agent').replace(' ', '').replace('(Sophia)', '').trim();
              const relatedLogs = agentLogs.filter(
                (logEntry) => 
                  logEntry.from.toLowerCase().includes(agentName.toLowerCase().replace(' ', '')) ||
                  logEntry.to.toLowerCase().includes(agentName.toLowerCase().replace(' ', '')) ||
                  logEntry.from.includes(a.agentId) ||
                  logEntry.to.includes(a.agentId) ||
                  (a.agentId === 'sales_agent' && (logEntry.from === 'SalesAgent' || logEntry.to === 'SalesAgent' || logEntry.from === 'System' || logEntry.to === 'User')) ||
                  (a.agentId === 'payment_agent' && (logEntry.from === 'PaymentAgent' || logEntry.to === 'PaymentAgent' || logEntry.from === 'POS-System' || logEntry.to === 'POS-System')) ||
                  (a.agentId === 'fulfillment_agent' && (logEntry.from === 'FulfillmentAgent' || logEntry.to === 'FulfillmentAgent')) ||
                  (a.agentId === 'loyalty_agent' && (logEntry.from === 'LoyaltyAgent' || logEntry.to === 'LoyaltyAgent' || logEntry.from === 'RewardsDB' || logEntry.to === 'RewardsDB')) ||
                  (a.agentId === 'inventory_agent' && (logEntry.from === 'InventoryAgent' || logEntry.to === 'InventoryAgent' || logEntry.from === 'StoreDB' || logEntry.to === 'StoreDB')) ||
                  (a.agentId === 'store_manager' && (logEntry.from === 'StoreManager' || logEntry.to === 'StoreManager'))
              );
              
              return (
                <div key={`agent-${i}`} className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-orange-500 rounded-full shadow-md"></div>
                  <div className="p-4 bg-white rounded-lg border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    {/* Agent Header */}
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-[1.3vw] text-gray-900">
                          {a.title}
                        </p>
                        {a.action && (
                          <p className="text-[0.85vw] text-gray-500">{a.action}</p>
                        )}
                      </div>
                      <span className="text-[0.8vw] bg-orange-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                        {a.agentId}
                      </span>
                    </div>
                    
                    {/* Agent Logs */}
                    {relatedLogs.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
                        {relatedLogs.map((logEntry, logIdx) => (
                          <div key={`log-${i}-${logIdx}`} className="text-[0.85vw]">
                            {/* From → To line */}
                            <div className="flex gap-3">
                              <span className="text-gray-400 font-mono whitespace-nowrap">
                                {logEntry.timestamp.toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit', 
                                  second: '2-digit',
                                  hour12: false
                                })}
                              </span>
                              <div className="flex-1">
                                <span className="text-orange-600 font-medium">{logEntry.from}</span>
                                <span className="text-gray-400 mx-1">→</span>
                                <span className="text-amber-600 font-medium">{logEntry.to}</span>
                              </div>
                            </div>
                            {/* Message line */}
                            <div className="flex gap-3 mt-0.5">
                              <span className="text-gray-400 font-mono whitespace-nowrap">
                                {logEntry.timestamp.toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit', 
                                  second: '2-digit',
                                  hour12: false
                                })}
                              </span>
                              <p className="text-gray-600 font-mono flex-1">{logEntry.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

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
            <div key={index}>
              {msg.type === "user" ? (
                // User message - right side
                <div className="flex justify-end mb-3 animate-fade-in">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 rounded-2xl rounded-tr-sm shadow-lg max-w-[70%]">
                    <p className="text-[1.1vw] font-medium">{msg.text}</p>
                  </div>
                </div>
              ) : msg.type === "payment" ? (
                // Payment message with method selection
                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-2 rounded-xl border border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in mb-3">
                  <div className="flex items-center mb-2 border-b border-orange-200 pb-1">
                    <div className="h-10 w-10 rounded-lg flex justify-center items-center bg-gradient-to-br from-orange-500 to-amber-500 mr-3 shadow-md">
                      <span className="text-white text-lg">💳</span>
                    </div>
                    <h3 className="font-bold text-[1.4vw] text-gray-900">
                      {msg.agentInfo ? msg.agentInfo.title : "Payment Agent"}
                    </h3>
                  </div>

                  <div className="pl-8 mb-2">
                    <p className="text-gray-800 mb-3 text-[1.1vw] leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </p>

                    {/* Payment Method Selection */}
                    {!selectedPaymentMethod ? (
                      <div className="bg-white rounded-lg p-3 border border-orange-200 shadow-sm">
                        <h3 className="font-bold text-[1vw] text-gray-800 mb-3">
                          Choose Payment Method
                        </h3>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedPaymentMethod("UPI")}
                            className="bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-lg p-3 flex flex-col items-center gap-2 transition-all shadow-sm hover:shadow-md"
                          >
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">📱</span>
                            </div>
                            <div className="font-bold text-[0.9vw] text-gray-800">
                              UPI
                            </div>
                          </button>

                          <button
                            onClick={() => setSelectedPaymentMethod("Credit Card")}
                            className="bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-lg p-3 flex flex-col items-center gap-2 transition-all shadow-sm hover:shadow-md"
                          >
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">💳</span>
                            </div>
                            <div className="font-bold text-[0.9vw] text-gray-800">
                              Credit Card
                            </div>
                          </button>

                          <button
                            onClick={() => setSelectedPaymentMethod("Debit Card")}
                            className="bg-white hover:bg-green-50 border-2 border-green-200 hover:border-green-400 rounded-lg p-3 flex flex-col items-center gap-2 transition-all shadow-sm hover:shadow-md"
                          >
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">💳</span>
                            </div>
                            <div className="font-bold text-[0.9vw] text-gray-800">
                              Debit Card
                            </div>
                          </button>

                          <button
                            onClick={() => setSelectedPaymentMethod("Cash")}
                            className="bg-white hover:bg-orange-50 border-2 border-orange-200 hover:border-orange-400 rounded-lg p-3 flex flex-col items-center gap-2 transition-all shadow-sm hover:shadow-md"
                          >
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">💵</span>
                            </div>
                            <div className="font-bold text-[0.9vw] text-gray-800">
                              Cash
                            </div>
                          </button>
                        </div>
                      </div>
                    ) : selectedPaymentMethod === "UPI" ? (
                      /* UPI Payment Form */
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <button
                          onClick={() => setSelectedPaymentMethod(null)}
                          className="text-orange-500 text-[0.9vw] mb-3 hover:underline font-medium"
                        >
                          ← Back to payment methods
                        </button>
                        <h3 className="font-bold text-[1vw] text-gray-800 mb-3">
                          Complete UPI Payment
                        </h3>

                        <div className="bg-purple-100 rounded-md p-3">
                          <div className="text-[0.85vw] text-gray-600 mb-2">
                            Enter UPI ID
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="username@upi"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-[0.9vw]"
                            />
                            <button
                              onClick={() => handleQuickReply("Payment Completed")}
                              className="px-4 py-2 bg-orange-500 text-white rounded text-[0.9vw] font-semibold hover:bg-orange-600 transition-all"
                            >
                              Pay ₹2,199
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : selectedPaymentMethod === "Credit Card" || selectedPaymentMethod === "Debit Card" ? (
                      /* Card Payment Form */
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <button
                          onClick={() => setSelectedPaymentMethod(null)}
                          className="text-orange-500 text-[0.9vw] mb-3 hover:underline font-medium"
                        >
                          ← Back to payment methods
                        </button>
                        <h3 className="font-bold text-[1vw] text-gray-800 mb-3">
                          Enter {selectedPaymentMethod} Details
                        </h3>

                        <div className="bg-blue-100 rounded-md p-3 space-y-3">
                          <div>
                            <div className="text-[0.85vw] text-gray-600 mb-1">
                              Card Number
                            </div>
                            <input
                              type="text"
                              placeholder="1234 5678 9012 3456"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-[0.9vw]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <div className="text-[0.85vw] text-gray-600 mb-1">
                                Expiry Date
                              </div>
                              <input
                                type="text"
                                placeholder="MM/YY"
                                className="w-full px-3 py-2 border border-gray-300 rounded text-[0.9vw]"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-[0.85vw] text-gray-600 mb-1">
                                CVV
                              </div>
                              <input
                                type="text"
                                placeholder="123"
                                className="w-full px-3 py-2 border border-gray-300 rounded text-[0.9vw]"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleQuickReply("Payment Completed")}
                            className="w-full py-2 bg-orange-500 text-white rounded text-[0.9vw] font-semibold hover:bg-orange-600 transition-all"
                          >
                            Pay ₹2,199
                          </button>
                        </div>
                      </div>
                    ) : selectedPaymentMethod === "Cash" ? (
                      /* Cash Payment Confirmation */
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <button
                          onClick={() => setSelectedPaymentMethod(null)}
                          className="text-orange-500 text-[0.9vw] mb-3 hover:underline font-medium"
                        >
                          ← Back to payment methods
                        </button>
                        <h3 className="font-bold text-[1vw] text-gray-800 mb-3">
                          Cash Payment at Counter
                        </h3>

                        <div className="bg-orange-100 rounded-md p-3">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">💵</span>
                            </div>
                            <div>
                              <div className="text-[0.9vw] font-semibold text-gray-800">
                                Pay ₹2,199 at the counter
                              </div>
                              <div className="text-[0.8vw] text-gray-600">
                                Please proceed to billing counter
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleQuickReply("Payment Completed")}
                            className="w-full py-2 bg-orange-500 text-white rounded text-[0.9vw] font-semibold hover:bg-orange-600 transition-all"
                          >
                            Confirm Cash Payment
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : msg.type === "loyalty" ? (
                // Loyalty message with rewards display - Orange/Amber theme
                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-2 rounded-xl border-2 border-orange-300 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in mb-3">
                  <div className="flex items-center mb-2 border-b border-orange-200 pb-1">
                    <div className="h-10 w-10 rounded-lg flex justify-center items-center bg-gradient-to-br from-orange-500 to-amber-500 mr-3 shadow-md">
                      <span className="text-white text-lg">🎁</span>
                    </div>
                    <h3 className="font-bold text-[1.4vw] text-orange-800">
                      {msg.agentInfo ? msg.agentInfo.title : "Loyalty Agent"}
                    </h3>
                  </div>

                  <div className="pl-8 mb-2">
                    <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg p-3 mb-3 border border-orange-200">
                      <h4 className="text-[1.1vw] font-bold text-orange-700 mb-2">
                        🎁 Loyalty Rewards Applied!
                      </h4>
                      <p className="text-[0.9vw] text-orange-600 mb-3">
                        Your rewards have been processed and applied
                      </p>
                      
                      <div className="space-y-2">
                        {/* Loyalty Points */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 border border-green-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">✅</span>
                            <div>
                              <div className="text-[0.85vw] font-semibold text-gray-800">
                                Loyalty Points Earned
                              </div>
                              <div className="text-[0.75vw] text-green-600">
                                +120 points added to your account
                              </div>
                            </div>
                          </div>
                          <span className="text-[0.9vw] font-bold text-green-600">120 pts</span>
                        </div>

                        {/* Coupon Applied */}
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-2 border border-orange-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎟️</span>
                            <div>
                              <div className="text-[0.85vw] font-semibold text-gray-800">
                                Coupon Applied
                              </div>
                              <div className="text-[0.75vw] text-orange-600">
                                FIRST10 - 10% discount applied
                              </div>
                            </div>
                          </div>
                          <span className="text-[0.9vw] font-bold text-orange-600">-₹120</span>
                        </div>

                        {/* Personalized Offer */}
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-2 border border-amber-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎯</span>
                            <div>
                              <div className="text-[0.85vw] font-semibold text-gray-800">
                                Personalized Offer
                              </div>
                              <div className="text-[0.75vw] text-amber-600">
                                Free delivery on next 3 orders
                              </div>
                            </div>
                          </div>
                          <span className="text-[0.75vw] font-bold text-amber-700 bg-amber-200 px-2 py-1 rounded">Unlocked</span>
                        </div>
                      </div>
                    </div>

                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {msg.quickReplies.map((reply, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickReply(reply)}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-3 py-1 rounded-full text-[0.9vw] font-medium transition-all hover:scale-105 shadow-md"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Agent message - left side with header
                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-2 rounded-xl border border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in mb-3">
                  <div className="flex items-center mb-2 border-b border-orange-200 pb-1">
                    <div className="h-10 w-10 rounded-lg flex justify-center items-center bg-gradient-to-br from-orange-500 to-amber-500 mr-3 shadow-md">
                      <span className="text-white text-lg">💬</span>
                    </div>
                    <h3 className="font-bold text-[1.4vw] text-gray-900">
                      {msg.agentInfo ? msg.agentInfo.title : "In-Store Assistant"}
                    </h3>
                  </div>

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
