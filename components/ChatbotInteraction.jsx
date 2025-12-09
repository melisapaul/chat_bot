// Dark theme compact version
import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import data from "../agents.json";
import "../page.css";

export default function ChatbotInteraction() {
  const agents = data.userJourney.agents;
  const [log, setLog] = useState([]);
  const [step, setStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [upi, setUpi] = useState("");
  const [feedback, setFeedback] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [purchaseType, setPurchaseType] = useState(null); // 'online' or 'offline'
  const [selectedStore, setSelectedStore] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);
  const chatEndRef = useRef(null);
  const searchRef = useRef("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log, isLoading]);

  const nextAgent = () => {
    if (step < agents.length) {
      setIsLoading(true);
      setLoadingMessage(`Processing with ${agents[step].title}...`);

      // Simulate agent processing time
      setTimeout(() => {
        searchRef.current.value = "";
        setQuery("");

        // Handle different flows based on purchase type
        const currentAgent = agents[step];

        if (
          purchaseType === "offline" &&
          (currentAgent.agentId === "payment_agent" ||
            currentAgent.agentId === "loyalty_agent" ||
            currentAgent.agentId === "post_purchase_agent")
        ) {
          // Skip these agents for offline purchases since fulfillment is handled in handleStoreSelection
          setStep(agents.length);
        } else {
          setLog((prev) => [...prev, currentAgent]);
          setStep((s) => s + 1);
        }

        setIsLoading(false);
        setLoadingMessage("");
      }, 1500 + Math.random() * 1000); // 1.5-2.5 seconds
    } else {
      // Reset everything
      setStep(0);
      setLog([]);
      setPurchaseType(null);
      setSelectedStore(null);
      setPurchaseData(null);
      setSelectedProduct(null);
    }
  };

  const isJourneyComplete = step >= agents.length;

  const updateProfiles = (storeOverride = null) => {
    // This would normally update the backend data
    // For demo purposes, we'll save to localStorage for the user profile to pick up
    const purchaseInfo = {
      type: purchaseType,
      product: selectedProduct,
      store: storeOverride || selectedStore,
      userId: "00001",
      userName: "Arjun Bose",
      timestamp: new Date().toISOString(),
    };

    setPurchaseData(purchaseInfo);

    // Save to sessionStorage for components to display (clears on refresh)
    if (purchaseType === "online") {
      sessionStorage.setItem("newOnlinePurchase", JSON.stringify(purchaseInfo));
    } else if (purchaseType === "offline") {
      sessionStorage.setItem("newOfflineOrder", JSON.stringify(purchaseInfo));
    }
  };

  const handlePurchaseTypeSelection = (type) => {
    setPurchaseType(type);
    if (type === "online") {
      // For online purchases, continue with next agent (payment)
      nextAgent();
    } else {
      // For offline, show store selection but don't advance agent yet
      // The inventory display will handle this
    }
  };

  const handleStoreSelection = (store) => {
    setSelectedStore(store);
    // Update profiles for offline purchase, passing the store since state hasn't updated yet
    updateProfiles(store);
    // Now advance to fulfillment agent for offline purchase with store info
    setTimeout(() => {
      const fulfillmentAgent = {
        agentId: "fulfillment_agent_offline",
        title: "Fulfillment Agent",
        status: "completed",
        action: "Processing offline purchase...",
        output: {
          orderId: `ORD${Date.now().toString().slice(-6)}`,
          customerName: "Arjun Bose",
          customerId: "00001",
          storeName: store.store_name,
          storeLocation: store.location,
          productName: selectedProduct?.name,
        },
      };
      setLog((prev) => [...prev, fulfillmentAgent]);
      setStep(agents.length);
      setIsLoading(false);
      setLoadingMessage("");
    }, 1500 + Math.random() * 1000);

    setIsLoading(true);
    setLoadingMessage(`Processing with Fulfillment Agent...`);
  };

  // Hardcoded store data for offline purchases
  const availableStores = [
    {
      id: "sk4",
      name: "Manager Sophia",
      store_name: "ABFRL Store South City",
      stock: "Available",
      location:
        "375 Prince Anwar Shah Road, South City Complex, Kolkata 700068",
    },
    {
      id: "sk5",
      name: "Manager Rahul",
      store_name: "City Centre Salt Lake, First Floor",
      stock: "Available",
      location: "DC Block, Sector 1, Salt Lake City, Kolkata 700064",
    },
    {
      id: "sk6",
      name: "Manager Priya",
      store_name: "Quest Mall, Second Floor",
      stock: "Limited",
      location: "33, Syed Amir Ali Ave, Park Circus, Kolkata 700017",
    },
    {
      id: "sk8",
      name: "Manager Neha",
      store_name: "South City Mall, Third Floor",
      stock: "Available",
      location: "375 Prince Anwar Shah Road, Jadavpur, Kolkata 700068",
    },
  ];

  return (
    <div className="h-screen top_section flex bg-[#0d0d0d] text-gray-200 font-sans text-[1.4vw] leading-[1.8vh]">
      {/* LEFT */}
      <div className="w-1/3 bottom_section p-4 overflow-y-auto border-r border-gray-700 bg-[#111]">
        <header className=" left_scroll min-h-[20%] max-h-[20%] p-4 border-b border-gray-700 bg-[#111] flex justify-between items-center">
          <div>
            <h1 className="text-[2vw] font-bold flex items-center">
              ⚡ Agent Timeline
            </h1>
            <p className="text-[1vw] text-gray-400 mt-6">
              Live Orchestration Log
            </p>
          </div>
        </header>
        {log.length === 0 && !isLoading && (
          <div className="text-center p-4 bg-[#1a1a1a] rounded border border-gray-700 text-gray-500 text-[1vw]">
            Waiting to start journey...
          </div>
        )}

        {isLoading && (
          <div className="text-center p-4 bg-[#1a1a1a] rounded border border-gray-700 text-blue-400 text-[1vw] animate-pulse">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </div>
            <p className="text-[0.9vw] text-gray-500">{loadingMessage}</p>
          </div>
        )}

        <div className="space-y-3 relative pl-2 h-500 overflow-y-auto ds">
          {(log.length > 0 || isLoading) && (
            <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-blue-600" />
          )}

          {log.map((a, i) => (
            <div key={i} className="relative pl-8">
              <div className="absolute left-0 top-1 h-3 w-3 bg-blue-500 rounded-full"></div>

              <div className="p-3 bg-[#1a1a1a] rounded border border-gray-700">
                <div className="flex justify-between mb-1">
                  <p className="font-bold text-[1.3vw]">{a.title}</p>
                  <span className="text-[0.8vw] bg-blue-900 px-2 py-1 rounded">
                    {a.agentId}
                  </span>
                </div>
                <p className="text-[1vw] text-gray-400">{a.action}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 h-3 w-3 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="p-3 bg-[#1a1a1a] rounded border border-gray-700 border-blue-500">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <p className="text-blue-400 text-[1.1vw]">
                    Agent Processing...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* {isJourneyComplete && (
            <p className="text-green-500 font-bold text-[1.5vw] pl-8 mt-2">Journey Completed</p>
          )} */}
        </div>
      </div>

      {/* RIGHT */}
      <div className="bottom_section w-2/3 flex flex-col bg-[#0f0f0f]">
        <header className="min-h-[20%] max-h-[20%] p-4 border-b border-gray-700 bg-[#111] flex justify-between items-center">
          <div>
            <h1 className="text-[2vw] font-bold flex items-center">
              🤖 AI Orchestrator
            </h1>
            <p className="text-[1vw] text-gray-400 mt-6">
              Multi-agent automation simulation
            </p>
          </div>
          <div className="text-[1vw] bg-[#1a1a1a] px-3 py-1 rounded border border-gray-700">
            Status:{" "}
            {isJourneyComplete ? (
              <span className="text-green-500">Complete</span>
            ) : (
              <span className="text-blue-500">In Progress</span>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {log.length === 0 && !isLoading && (
            <div className="h-full flex flex-col justify-center items-center text-gray-600">
              <span className="text-[8vw]">👋</span>
              <p className="text-[1.5vw]">Click "Search" to begin!</p>
            </div>
          )}

          {log.map((agent, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] p-4 rounded border border-gray-700"
            >
              <div className="flex items-center mb-3 border-b border-gray-700 pb-2">
                <div className="h-10 w-10 rounded flex justify-center items-center bg-blue-900 mr-3">
                  💬
                </div>
                <h3 className="font-bold text-[1.4vw]">{agent.title}</h3>
              </div>

              {agent.output?.message && (
                <p className="text-gray-300 mb-4 text-[1.1vw] pl-12">
                  {agent.output.message}
                </p>
              )}

              <div className="pl-12 space-y-4">
                {/* PRODUCT */}
                {agent.output?.products && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {agent.output.products.map((p) => (
                      <div
                        key={p.id}
                        className={`p-3 rounded cursor-pointer border ${
                          selectedProduct?.id === p.id
                            ? "bg-blue-900 border-blue-500"
                            : "bg-[#111] border-gray-700"
                        }`}
                        onClick={() => {
                          setSelectedProduct(p);
                          nextAgent();
                        }}
                      >
                        <div className="flex justify-between mb-2">
                          <p className="font-bold text-[1.1vw]">{p.name}</p>
                          <span className="bg-blue-800 px-2 py-1 rounded">
                            ₹{p.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-400 text-[1vw]">{p.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* INVENTORY */}
                {agent.agentId === "inventory_agent" &&
                  agent.output?.availability && (
                    <div className="bg-[#111] p-4 rounded border border-gray-700">
                      {!purchaseType ? (
                        <div>
                          <div className="text-blue-400 font-bold mb-4 text-[1.2vw] flex items-center">
                            📦 Choose Purchase Method
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <button
                              onClick={() =>
                                handlePurchaseTypeSelection("online")
                              }
                              className="bg-green-700 hover:bg-green-600 text-white p-4 rounded border border-green-600 transition-colors duration-200 flex flex-col items-center gap-2"
                            >
                              <span className="text-2xl">🛒</span>
                              <span className="font-bold text-[1.1vw]">
                                Buy Online
                              </span>
                              <span className="text-[0.9vw] text-green-200">
                                Home Delivery
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                handlePurchaseTypeSelection("offline")
                              }
                              className="bg-blue-700 hover:bg-blue-600 text-white p-4 rounded border border-blue-600 transition-colors duration-200 flex flex-col items-center gap-2"
                            >
                              <span className="text-2xl">🏪</span>
                              <span className="font-bold text-[1.1vw]">
                                Nearest Store
                              </span>
                              <span className="text-[0.9vw] text-blue-200">
                                Store Pickup
                              </span>
                            </button>
                          </div>
                        </div>
                      ) : purchaseType === "offline" && !selectedStore ? (
                        <div>
                          <div className="text-blue-400 font-bold mb-4 text-[1.1vw] flex items-center">
                            🏪 Select Store for Pickup
                          </div>
                          <ul className="space-y-2">
                            {availableStores.map((store, idx) => (
                              <li key={idx}>
                                <button
                                  onClick={() => handleStoreSelection(store)}
                                  className="w-full flex justify-between items-center bg-[#0f0f0f] hover:bg-[#1a1a1a] p-3 rounded border border-gray-700 transition-colors duration-200"
                                >
                                  <div className="text-left">
                                    <div className="text-[1vw] font-semibold text-white">
                                      {store.store_name}
                                    </div>
                                    <div className="text-[0.8vw] text-gray-400">
                                      {store.name}
                                    </div>
                                  </div>
                                  <span
                                    className={`px-3 py-1 text-[0.9vw] rounded font-bold ${
                                      store.stock === "Available"
                                        ? "bg-green-900 text-green-300"
                                        : "bg-orange-900 text-orange-300"
                                    }`}
                                  >
                                    {store.stock}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : purchaseType === "online" ? (
                        <div className="text-green-500 font-bold mb-2 text-[1.1vw] flex items-center">
                          ✔ Online Purchase - Proceeding to Payment
                        </div>
                      ) : (
                        <div className="text-blue-500 font-bold mb-2 text-[1.1vw] flex items-center">
                          ✔ Store Selected: {selectedStore?.store_name}
                        </div>
                      )}
                    </div>
                  )}
                {/* DELIVERY */}
                {agent.agentId === "fulfillment_agent" && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-xl shadow">
                    <h4 className="text-green-800 font-bold text-lg mb-2">
                      Delivery Scheduled
                    </h4>
                    <p className="text-green-700 font-medium">
                      Arrival: {agent.output.delivery.date}
                    </p>
                  </div>
                )}
                {/* OFFLINE FULFILLMENT */}
                {agent.agentId === "fulfillment_agent_offline" && (
                  <div className="bg-[#111] p-6 rounded border border-green-700">
                    <div className="text-green-400 font-bold text-[1.3vw] mb-4 flex items-center">
                      ✅ Order Confirmed - Store Pickup
                    </div>
                    <div className="bg-[#0f0f0f] p-4 rounded border border-gray-700 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-[1vw]">
                        <div>
                          <span className="text-gray-400">Order ID:</span>
                          <div className="font-mono font-bold text-green-400">
                            {agent.output?.orderId}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Customer:</span>
                          <div className="font-bold text-white">
                            {agent.output?.customerName}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">User ID:</span>
                          <div className="font-mono font-bold text-blue-400">
                            {agent.output?.customerId}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Product:</span>
                          <div className="font-bold text-white">
                            {agent.output?.productName}
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-600">
                        <div className="text-gray-400 text-[0.9vw] mb-2">
                          Pickup Location:
                        </div>
                        <div className="font-bold text-yellow-400 text-[1.1vw] mb-1">
                          {agent.output?.storeName}
                        </div>
                        {agent.output?.storeLocation && (
                          <div className="text-gray-300 text-[0.9vw] mb-3">
                            {agent.output?.storeLocation}
                          </div>
                        )}
                        <div className="text-gray-400 text-[0.9vw] mb-1">
                          Pickup Hours:
                        </div>
                        <div className="font-bold text-white text-[1vw]">
                          10:00 AM - 9:00 PM
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-900/30 rounded border border-green-700">
                      <div className="text-green-300 font-bold text-center text-[1.1vw]">
                        🙏 Thank you for purchasing from ABFRL!
                      </div>
                      <div className="text-green-400 text-center text-[0.9vw] mt-1">
                        Your order is ready for pickup at the selected store.
                      </div>
                    </div>
                  </div>
                )}
                {/* LOYALTY */}
                {agent.agentId === "loyalty_agent" && (
                  <div className="bg-[#111] p-4 rounded border border-gray-700">
                    <h4 className="text-yellow-400 font-bold text-[1.2vw] mb-3">
                      Savings Applied
                    </h4>
                    <div className="flex gap-3">
                      <div className="bg-[#0f0f0f] p-2 rounded border border-gray-700 text-[1vw]">
                        🎟 Coupon:{" "}
                        <span className="font-mono font-bold">
                          {agent.output.coupon}
                        </span>
                      </div>
                      <div className="bg-[#0f0f0f] p-2 rounded border border-gray-700 text-[1vw]">
                        ⭐ Points:{" "}
                        <span className="font-bold">{agent.output.points}</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* PAYMENT */}
                {agent.agentId === "payment_agent" && (
                  <div className="bg-[#111] p-4 rounded border border-gray-700 max-w-sm">
                    <label className="block text-gray-300 mb-2 text-[1vw]">
                      Enter UPI ID
                    </label>
                    <div className="flex">
                      <input
                        value={upi}
                        onChange={(e) => setUpi(e.target.value)}
                        placeholder="username@upi"
                        className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded-l outline-none"
                      />
                      <button
                        className="bg-green-700 px-4 rounded-r hover:bg-green-600 transition-colors"
                        onClick={() => {
                          if (upi.trim()) {
                            // For online purchases, update profiles and continue to next agent
                            updateProfiles();
                            nextAgent();
                          }
                        }}
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                )}
                {/* FEEDBACK */}
                {agent.agentId === "post_purchase_agent" && (
                  <div className="bg-[#111] p-4 rounded border border-gray-700 max-w-lg">
                    <label className="block text-gray-300 mb-2 text-[1vw]">
                      Your Feedback
                    </label>
                    <textarea
                      rows="3"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded outline-none"
                    ></textarea>
                    <button className="mt-3 w-full bg-blue-700 py-2 rounded">
                      Submit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="bg-[#1a1a1a] p-4 rounded border border-gray-700 border-blue-500">
              <div className="flex items-center mb-3 border-b border-gray-700 pb-2">
                <div className="h-10 w-10 rounded flex justify-center items-center bg-blue-900 mr-3 animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
                <h3 className="font-bold text-[1.4vw] text-blue-400">
                  Agent Working...
                </h3>
              </div>
              <div className="pl-12">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-[1vw]">{loadingMessage}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="p-4 min-h-[14%] border-t border-gray-700 bg-[#111] flex justify-between items-center">
          <span className="text-[1vw] text-gray-400">
            {isJourneyComplete
              ? "All steps executed."
              : `Step ${step} of ${agents.length}`}
          </span>

          {!isJourneyComplete && (
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Query..."
              className="p-2 bg-[#0f0f0f] border border-gray-700 rounded text-[1vw] min-w-[60%]"
            />
          )}

          <button
            onClick={nextAgent}
            disabled={isLoading}
            className={`px-4 py-2 rounded text-[1vw] flex items-center gap-2 ${
              isLoading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-600"
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading
              ? "Processing..."
              : isJourneyComplete
              ? "Restart"
              : "Search"}
          </button>
        </div>
      </div>
    </div>
  );
}
