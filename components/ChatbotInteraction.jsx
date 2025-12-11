// Dark theme compact version
import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import data from "../agents.json";
import adminData from "../data/admin.json";
import "../page.css";

export default function ChatbotInteraction({ onClose }) {
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
  const [isStorekeeperMode, setIsStorekeeperMode] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [showMoreProducts, setShowMoreProducts] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'upi', 'credit', 'debit', 'cod'

  const [userSelectedMode, setUserSelectedMode] = useState("customer"); // 'customer' or 'storekeeper'
  const chatEndRef = useRef(null);
  const searchRef = useRef("");

  // Helper function to get specific loading message based on agent
  const getAgentLoadingMessage = (agentId) => {
    const messages = {
      recommendation_agent: "Analyzing preferences and finding best products...",
      inventory_agent: "Finding in inventory and checking stock availability...",
      payment_agent: "Processing payment and verifying transaction...",
      fulfillment_agent: "Arranging delivery and scheduling slot...",
      loyalty_agent: "Calculating rewards and applying offers...",
      post_purchase_agent: "Preparing feedback form and assistance options..."
    };
    return messages[agentId] || "Processing...";
  };

  // Define storekeeper workflow agents
  const storekeeperAgents = [
    {
      agentId: "recommend_agent",
      title: "Recommend Agent",
      action: "Analyzing customer product details...",
      output: { showProductDetails: true },
    },
    {
      agentId: "payment_agent",
      title: "Payment Agent",
      action: "Processing payment confirmation...",
      output: { message: "Payment has been confirmed for this order." },
    },
    {
      agentId: "fulfillment_agent_store",
      title: "Fulfillment Agent",
      action: "Dispatching product from store...",
      output: {
        message:
          "Your product is dispatched from the store and ready for pickup. Store pickup process completed successfully!",
      },
    },
  ];

  const handleBackButton = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleModeToggle = (mode) => {
    setUserSelectedMode(mode);
    // Reset states when switching modes
    setLog([]);
    setStep(0);
    setIsStorekeeperMode(false);
    setCustomerDetails(null);
    setSelectedProduct(null);
    setPurchaseType(null);
    setSelectedStore(null);
    setPurchaseData(null);
    setQuery("");
    if (searchRef.current) {
      searchRef.current.value = "";
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log, isLoading]);

  // Admin data is imported at the top of the file

  const searchByProductId = async (productId) => {
    setIsLoading(true);
    setLoadingMessage("Searching for product and customer details...");

    setTimeout(() => {
      // Find the product
      const product = adminData.products.find((p) => p.id === productId.trim());

      if (product) {
        // Find customers who purchased this product
        const customers = adminData.users.filter(
          (user) => user.purchases && user.purchases.includes(productId.trim())
        );

        if (customers.length > 0) {
          // For demo, take the first customer or a recent one
          const customer = customers[0];

          setCustomerDetails({
            customer: customer,
            product: product,
            orderId: `ORD${Date.now().toString().slice(-6)}`,
            orderDate: new Date().toLocaleDateString(),
            status: "Ready for Pickup",
          });

          setSelectedProduct(product);
          setIsStorekeeperMode(true);
          setStep(0);
          setLog([]);

          // Start with first storekeeper agent automatically
          setTimeout(() => {
            const firstAgent = storekeeperAgents[0];
            setLog((prev) => [...prev, firstAgent]);
            setStep(1); // Move to next step after first agent
            setIsLoading(false);
            setLoadingMessage("");
          }, 1500);
        } else {
          alert("No customer found who purchased this product.");
        }
      } else {
        alert("Product not found. Please check the Product ID.");
      }

      setIsLoading(false);
      setLoadingMessage("");
      setQuery("");
      searchRef.current.value = "";
    }, 1500);
  };

  const nextStorekeeperAgent = () => {
    if (step < storekeeperAgents.length) {
      setIsLoading(true);
      const currentAgent = storekeeperAgents[step];
      setLoadingMessage(getAgentLoadingMessage(currentAgent.agentId));

      setTimeout(() => {
        setLog((prev) => [...prev, currentAgent]);
        setStep((s) => s + 1);
        setIsLoading(false);
        setLoadingMessage("");
      }, 1500 + Math.random() * 1000);
    } else {
      // Reset storekeeper workflow
      setStep(0);
      setLog([]);
      setIsStorekeeperMode(false);
      setCustomerDetails(null);
      setSelectedProduct(null);
    }
  };

  const nextAgent = () => {
    if (step < agents.length) {
      setIsLoading(true);
      setLoadingMessage(getAgentLoadingMessage(agents[step].agentId));

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
    setLoadingMessage("Arranging delivery and scheduling slot...");
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
    <div className="h-screen top_section flex bg-gradient-to-br from-orange-100 via-yellow-100 to-amber-100 text-gray-800 font-sans text-[1.4vw] leading-[1.8vh]">
      {/* LEFT */}
      <div className="w-1/3 bottom_section overflow-y-auto border-r border-orange-300 bg-white shadow-lg">
        <header className=" left_scroll min-h-[20%] max-h-[20%] p-4 border-b border-orange-300 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 flex justify-between items-center shadow-lg">
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
              Waiting to start journey...
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

            {/* {isJourneyComplete && (
            <p className="text-green-500 font-bold text-[1.5vw] pl-8 mt-2">Journey Completed</p>
          )} */}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="bottom_section w-2/3 flex flex-col bg-white">
        <header className="min-h-[20%] max-h-[20%] p-4 border-b border-orange-300 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 flex justify-between items-center shadow-lg">
          <div>
            <h1 className="text-[2vw] font-bold flex items-center text-white drop-shadow-md">
              {isStorekeeperMode ? "🏪" : "🤖"}{" "}
              {isStorekeeperMode ? "Store Assistant" : "AI Orchestrator"}
            </h1>
            <p className="text-[1vw] text-orange-100 mt-2">
              {isStorekeeperMode
                ? "Store pickup order management"
                : "Multi-agent automation simulation"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Mode Toggle Buttons */}
            <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-1 border border-orange-200">
              <button
                onClick={() => handleModeToggle("customer")}
                className={`px-4 py-2 rounded text-[0.9vw] transition-all ${
                  userSelectedMode === "customer"
                    ? "bg-white text-orange-600 shadow-sm font-bold"
                    : "text-white hover:bg-white/30"
                }`}
              >
                👤 Customer
              </button>
              <button
                onClick={() => handleModeToggle("storekeeper")}
                className={`px-4 py-2 rounded text-[0.9vw] transition-all ${
                  userSelectedMode === "storekeeper"
                    ? "bg-white text-orange-600 shadow-sm font-bold"
                    : "text-white hover:bg-white/30"
                }`}
              >
                🏪 Storekeeper
              </button>
            </div>

            <div className="text-[1vw] bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg border border-orange-200 shadow-md">
              Status:{" "}
              {isJourneyComplete ||
              (isStorekeeperMode && step >= storekeeperAgents.length) ? (
                <span className="text-green-200 font-bold">Complete</span>
              ) : (
                <span className="text-white font-bold">In Progress</span>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {log.length === 0 && !isLoading && (
            <div className="h-full flex flex-col justify-center items-center text-gray-700">
              <span className="text-[8vw]">
                {userSelectedMode === "storekeeper" ? "🏪" : "👋"}
              </span>
              <p className="text-[1.5vw] font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent text-center">
                {userSelectedMode === "storekeeper"
                  ? "Enter a Product ID to look up customer orders"
                  : 'Click "Search" to begin your shopping journey!'}
              </p>
              {userSelectedMode === "storekeeper" && (
                <p className="text-[1vw] text-gray-600 mt-2 text-center">
                  Example: p001, p002, p1, p2
                </p>
              )}
            </div>
          )}

          {log.map((agent, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 rounded-xl border border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in"
            >
              <div className="flex items-center mb-3 border-b border-orange-200 pb-2">
                <div className="h-10 w-10 rounded-lg flex justify-center items-center bg-gradient-to-br from-orange-500 to-amber-500 mr-3 shadow-md">
                  <span className="text-white text-lg">💬</span>
                </div>
                <h3 className="font-bold text-[1.4vw] text-gray-900">
                  {agent.title}
                </h3>
              </div>

              {agent.output?.message && (
                <div className="mb-4 pl-12">
                  {isStorekeeperMode &&
                  agent.agentId === "fulfillment_agent_store" ? (
                    <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 rounded-2xl border-2 border-orange-400 shadow-xl">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-2xl">✅</span>
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-[1.3vw] mb-1">
                            Order Pickup Completed!
                          </h4>
                          <p className="text-orange-100 text-[0.9vw]">
                            Customer has successfully collected the product from
                            the store.
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-white text-[1.1vw] leading-relaxed font-medium">
                          Thank you for completing the pickup process.
                          <br />
                          <span className="text-orange-100">
                            The collection process is complete, and no further
                            action is required.
                          </span>
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-center">
                        <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                          <span className="text-orange-200 text-[0.9vw] font-semibold">
                            ✨ Pickup Process Complete ✨
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 mb-4 text-[1.1vw] pl-12">
                      {agent.output.message}
                    </p>
                  )}
                </div>
              )}

              <div className="pl-12 space-y-4">
                {/* STOREKEEPER CUSTOMER DETAILS */}
                {isStorekeeperMode &&
                  agent.agentId === "recommend_agent" &&
                  customerDetails && (
                    <div
                      className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border border-blue-300 shadow-lg animate-fade-in"
                      style={{ animationDelay: "0.3s" }}
                    >
                      <h4 className="text-blue-700 font-bold text-[1.3vw] mb-4 flex items-center">
                        📋 Customer Order Details
                      </h4>
                      <div className="bg-white p-4 rounded-lg border border-blue-200 space-y-3 shadow-sm">
                        <div className="grid grid-cols-2 gap-4 text-[1vw]">
                          <div>
                            <span className="text-gray-600">
                              Customer Name:
                            </span>
                            <div className="font-bold text-gray-900">
                              Arjun Bose
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Customer ID:</span>
                            <div className="font-mono font-bold text-blue-600">
                              0001
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Product:</span>
                            <div className="font-bold text-gray-900">
                              {customerDetails.product.name}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Product ID:</span>
                            <div className="font-mono font-bold text-green-600">
                              {customerDetails.product.id}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Price:</span>
                            <div className="font-bold text-orange-600">
                              ₹{customerDetails.product.price?.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Order ID:</span>
                            <div className="font-mono font-bold text-green-600">
                              {customerDetails.orderId}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Order Date:</span>
                            <div className="font-bold text-gray-900">
                              {customerDetails.orderDate}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <div className="font-bold text-green-600">
                              {customerDetails.status}
                            </div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-blue-200">
                          <div className="text-gray-600 text-[0.9vw] mb-2">
                            Customer Address:
                          </div>
                          <div className="text-gray-900 text-[1vw]">
                            {customerDetails.customer.address}
                          </div>
                          <div className="text-gray-600 text-[0.9vw] mt-2 mb-1">
                            Phone:
                          </div>
                          <div className="text-gray-900 text-[1vw]">
                            {customerDetails.customer.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* PRODUCT */}
                {agent.output?.products && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {agent.output.products.map((p) => (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl cursor-pointer border transition-all duration-300 ${
                          selectedProduct?.id === p.id
                            ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white border-orange-500 shadow-lg scale-105"
                            : "bg-white border-orange-300 hover:border-orange-500 hover:shadow-md hover:scale-102"
                        }`}
                        onClick={() => {
                          setSelectedProduct(p);
                          nextAgent();
                        }}
                      >
                        {p.image && (
                          <div className="mb-3 rounded-lg overflow-hidden bg-gray-100">
                            <img 
                              src={p.image} 
                              alt={p.name}
                              className="w-full h-40 object-cover"
                            />
                          </div>
                        )}
                        <div className="flex justify-between mb-2">
                          <p
                            className={`font-bold text-[1.1vw] ${
                              selectedProduct?.id === p.id
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {p.name}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-lg font-bold ${
                              selectedProduct?.id === p.id
                                ? "bg-white/20 text-white"
                                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                            }`}
                          >
                            ₹{p.price.toLocaleString()}
                          </span>
                        </div>
                        <p
                          className={`text-[1vw] ${
                            selectedProduct?.id === p.id
                              ? "text-orange-100"
                              : "text-gray-600"
                          }`}
                        >
                          {p.reason}
                        </p>
                      </div>
                    ))}
                    
                    {/* MORE PRODUCTS */}
                    {showMoreProducts && agent.output?.moreProducts && agent.output.moreProducts.map((p) => (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl cursor-pointer border transition-all duration-300 ${
                          selectedProduct?.id === p.id
                            ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white border-orange-500 shadow-lg scale-105"
                            : "bg-white border-orange-300 hover:border-orange-500 hover:shadow-md hover:scale-102"
                        }`}
                        onClick={() => {
                          setSelectedProduct(p);
                          nextAgent();
                        }}
                      >
                        {p.image && (
                          <div className="mb-3 rounded-lg overflow-hidden bg-gray-100">
                            <img 
                              src={p.image} 
                              alt={p.name}
                              className="w-full h-40 object-cover"
                            />
                          </div>
                        )}
                        <div className="flex justify-between mb-2">
                          <p
                            className={`font-bold text-[1.1vw] ${
                              selectedProduct?.id === p.id
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {p.name}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-lg font-bold ${
                              selectedProduct?.id === p.id
                                ? "bg-white/20 text-white"
                                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                            }`}
                          >
                            ₹{p.price.toLocaleString()}
                          </span>
                        </div>
                        <p
                          className={`text-[1vw] ${
                            selectedProduct?.id === p.id
                              ? "text-orange-100"
                              : "text-gray-600"
                          }`}
                        >
                          {p.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* SEE MORE BUTTON */}
                {agent.output?.products && agent.output?.moreProducts && !showMoreProducts && (
                  <div className="mt-4 flex justify-center">
                    <button
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-[1vw]"
                      onClick={() => setShowMoreProducts(true)}
                    >
                      See More Products
                    </button>
                  </div>
                )}

                {/* INVENTORY */}
                {agent.agentId === "inventory_agent" &&
                  agent.output?.availability && (
                    <div className="bg-gray-50 p-4 rounded border border-gray-300">
                      {!purchaseType ? (
                        <div>
                          <div className="text-gray-800 font-bold mb-4 text-[1.2vw] flex items-center">
                            📦 Choose Purchase Method
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <button
                              onClick={() =>
                                handlePurchaseTypeSelection("online")
                              }
                              className="bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-xl border border-green-500 transition-all duration-300 flex flex-col items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              <span className="text-2xl">🛒</span>
                              <span className="font-bold text-[1.1vw]">
                                Buy Online
                              </span>
                              <span className="text-[0.9vw] text-green-100">
                                Home Delivery
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                handlePurchaseTypeSelection("offline")
                              }
                              className="bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white p-4 rounded-xl border border-orange-400 transition-all duration-300 flex flex-col items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              <span className="text-2xl">🏪</span>
                              <span className="font-bold text-[1.1vw]">
                                Nearest Store
                              </span>
                              <span className="text-[0.9vw] text-orange-100">
                                Store Pickup
                              </span>
                            </button>
                          </div>
                        </div>
                      ) : purchaseType === "offline" && !selectedStore ? (
                        <div>
                          <div className="text-gray-800 font-bold mb-4 text-[1.1vw] flex items-center">
                            🏪 Select Store for Pickup
                          </div>
                          <ul className="space-y-2">
                            {availableStores.map((store, idx) => (
                              <li key={idx}>
                                <button
                                  onClick={() => handleStoreSelection(store)}
                                  className="w-full flex justify-between items-center bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 p-3 rounded-xl border border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-102"
                                >
                                  <div className="text-left">
                                    <div className="text-[1vw] font-semibold text-gray-900">
                                      {store.store_name}
                                    </div>
                                    <div className="text-[0.8vw] text-gray-600">
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
                        <div className="text-green-700 font-bold mb-2 text-[1.1vw] flex items-center">
                          ✔ Online Purchase - Proceeding to Payment
                        </div>
                      ) : (
                        <div className="text-gray-800 font-bold mb-2 text-[1.1vw] flex items-center">
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
                  <div className="bg-white p-6 rounded border border-gray-300">
                    <div className="text-green-700 font-bold text-[1.3vw] mb-4 flex items-center">
                      ✅ Order Confirmed - Store Pickup
                    </div>
                    <div className="bg-gray-50 p-4 rounded border border-gray-300 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-[1vw]">
                        <div>
                          <span className="text-gray-600">Order ID:</span>
                          <div className="font-mono font-bold text-gray-900">
                            {agent.output?.orderId}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Customer:</span>
                          <div className="font-bold text-gray-900">
                            {agent.output?.customerName}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">User ID:</span>
                          <div className="font-mono font-bold text-gray-900">
                            {agent.output?.customerId}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Product:</span>
                          <div className="font-bold text-gray-900">
                            {agent.output?.productName}
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-300">
                        <div className="text-gray-600 text-[0.9vw] mb-2">
                          Pickup Location:
                        </div>
                        <div className="font-bold text-gray-900 text-[1.1vw] mb-1">
                          {agent.output?.storeName}
                        </div>
                        {agent.output?.storeLocation && (
                          <div className="text-gray-700 text-[0.9vw] mb-3">
                            {agent.output?.storeLocation}
                          </div>
                        )}
                        <div className="text-gray-600 text-[0.9vw] mb-1">
                          Pickup Hours:
                        </div>
                        <div className="font-bold text-gray-900 text-[1vw]">
                          10:00 AM - 9:00 PM
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded border border-green-300">
                      <div className="text-green-700 font-bold text-center text-[1.1vw]">
                        🙏 Thank you for purchasing from ABFRL!
                      </div>
                      <div className="text-green-600 text-center text-[0.9vw] mt-1">
                        Your order is ready for pickup at the selected store.
                      </div>
                    </div>
                  </div>
                )}
                {/* LOYALTY */}
                {agent.agentId === "loyalty_agent" && (
                  <div className="bg-gray-50 p-4 rounded border border-gray-300">
                    <h4 className="text-gray-800 font-bold text-[1.2vw] mb-3">
                      Savings Applied
                    </h4>
                    <div className="flex gap-3">
                      <div className="bg-white p-2 rounded border border-gray-300 text-[1vw] text-gray-800">
                        🎟 Coupon:{" "}
                        <span className="font-mono font-bold">
                          {agent.output.coupon}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-300 text-[1vw] text-gray-800">
                        ⭐ Points:{" "}
                        <span className="font-bold">{agent.output.points}</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* PAYMENT */}
                {agent.agentId === "payment_agent" && (
                  <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 rounded-xl border border-orange-200 max-w-3xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {!paymentMethod ? (
                      <div>
                        <label className="block text-gray-800 mb-4 text-[1.2vw] font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                          Choose Payment Method
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <button
                            onClick={() => setPaymentMethod('upi')}
                            className="bg-white hover:bg-gradient-to-br hover:from-orange-100 hover:to-amber-100 border-2 border-orange-300 hover:border-orange-500 p-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white text-2xl">📱</span>
                            </div>
                            <span className="font-bold text-gray-800 text-[1vw]">UPI</span>
                          </button>
                          
                          <button
                            onClick={() => setPaymentMethod('credit')}
                            className="bg-white hover:bg-gradient-to-br hover:from-orange-100 hover:to-amber-100 border-2 border-orange-300 hover:border-orange-500 p-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white text-2xl">💳</span>
                            </div>
                            <span className="font-bold text-gray-800 text-[1vw]">Credit Card</span>
                          </button>
                          
                          <button
                            onClick={() => setPaymentMethod('debit')}
                            className="bg-white hover:bg-gradient-to-br hover:from-orange-100 hover:to-amber-100 border-2 border-orange-300 hover:border-orange-500 p-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white text-2xl">💳</span>
                            </div>
                            <span className="font-bold text-gray-800 text-[1vw]">Debit Card</span>
                          </button>
                          
                          <button
                            onClick={() => setPaymentMethod('cod')}
                            className="bg-white hover:bg-gradient-to-br hover:from-orange-100 hover:to-amber-100 border-2 border-orange-300 hover:border-orange-500 p-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white text-2xl">💵</span>
                            </div>
                            <span className="font-bold text-gray-800 text-[1vw]">Cash on Delivery</span>
                          </button>
                        </div>
                      </div>
                    ) : paymentMethod === 'upi' ? (
                      <div>
                        <button
                          onClick={() => setPaymentMethod(null)}
                          className="mb-4 text-orange-600 hover:text-orange-700 font-semibold text-[0.9vw] flex items-center gap-1"
                        >
                          ← Back to payment methods
                        </button>
                        <label className="block text-gray-800 mb-3 text-[1.1vw] font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                          Enter your UPI ID to complete payment
                        </label>
                        <div className="bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 p-4 rounded-lg border border-orange-300 shadow-inner">
                          <label className="block text-gray-700 mb-2 text-[0.9vw] font-medium">
                            Enter UPI ID
                          </label>
                          <div className="flex shadow-md">
                            <input
                              value={upi}
                              onChange={(e) => setUpi(e.target.value)}
                              placeholder="username@upi"
                              className="flex-1 p-3 bg-white border border-orange-200 rounded-l text-gray-800 placeholder-gray-500 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                            />
                            <button
                              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-6 py-3 rounded-r text-white font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                              onClick={() => {
                                if (upi.trim()) {
                                  if (isStorekeeperMode) {
                                    nextStorekeeperAgent();
                                  } else {
                                    updateProfiles();
                                    nextAgent();
                                  }
                                }
                              }}
                            >
                              Pay
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : paymentMethod === 'credit' || paymentMethod === 'debit' ? (
                      <div>
                        <button
                          onClick={() => setPaymentMethod(null)}
                          className="mb-4 text-orange-600 hover:text-orange-700 font-semibold text-[0.9vw] flex items-center gap-1"
                        >
                          ← Back to payment methods
                        </button>
                        <label className="block text-gray-800 mb-3 text-[1.1vw] font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                          Enter {paymentMethod === 'credit' ? 'Credit' : 'Debit'} Card Details
                        </label>
                        <div className="bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 p-4 rounded-lg border border-orange-300 shadow-inner space-y-3">
                          <div>
                            <label className="block text-gray-700 mb-2 text-[0.9vw] font-medium">Card Number</label>
                            <input
                              placeholder="1234 5678 9012 3456"
                              className="w-full p-3 bg-white border border-orange-200 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-gray-700 mb-2 text-[0.9vw] font-medium">Expiry Date</label>
                              <input
                                placeholder="MM/YY"
                                className="w-full p-3 bg-white border border-orange-200 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-700 mb-2 text-[0.9vw] font-medium">CVV</label>
                              <input
                                placeholder="123"
                                type="password"
                                maxLength="3"
                                className="w-full p-3 bg-white border border-orange-200 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                              />
                            </div>
                          </div>
                          <button
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-6 py-3 rounded text-white font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mt-2"
                            onClick={() => {
                              if (isStorekeeperMode) {
                                nextStorekeeperAgent();
                              } else {
                                updateProfiles();
                                nextAgent();
                              }
                            }}
                          >
                            Pay Now
                          </button>
                        </div>
                      </div>
                    ) : paymentMethod === 'cod' ? (
                      <div>
                        <button
                          onClick={() => setPaymentMethod(null)}
                          className="mb-4 text-orange-600 hover:text-orange-700 font-semibold text-[0.9vw] flex items-center gap-1"
                        >
                          ← Back to payment methods
                        </button>
                        <label className="block text-gray-800 mb-3 text-[1.1vw] font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                          Cash on Delivery Selected
                        </label>
                        <div className="bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 p-4 rounded-lg border border-orange-300 shadow-inner">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-4xl">💵</span>
                            <div>
                              <p className="text-gray-800 font-semibold text-[1vw]">Pay when you receive your order</p>
                              <p className="text-gray-600 text-[0.9vw]">No advance payment required</p>
                            </div>
                          </div>
                          <button
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-6 py-3 rounded text-white font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                            onClick={() => {
                              if (isStorekeeperMode) {
                                nextStorekeeperAgent();
                              } else {
                                updateProfiles();
                                nextAgent();
                              }
                            }}
                          >
                            Confirm Order
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
                {/* FEEDBACK */}
                {agent.agentId === "post_purchase_agent" && (
                  <div className="bg-gray-50 p-4 rounded border border-gray-300 max-w-lg">
                    <label className="block text-gray-800 mb-2 text-[1vw]">
                      Your Feedback
                    </label>
                    <textarea
                      rows="3"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded outline-none text-gray-800"
                    ></textarea>
                    <button className="mt-3 w-full bg-gradient-to-r from-orange-500 to-amber-500 py-2 rounded-xl text-white font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg">
                      Submit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 rounded-xl border border-orange-300 shadow-lg">
              <div className="flex items-center mb-3 border-b border-orange-200 pb-2">
                <div className="h-10 w-10 rounded-lg flex justify-center items-center bg-gradient-to-br from-orange-500 to-amber-500 mr-3 animate-pulse shadow-md">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
                <h3 className="font-bold text-[1.4vw] text-orange-600">
                  Agent Working...
                </h3>
              </div>
              <div className="pl-12">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
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

        <div className="p-4 min-h-[14%] border-t border-gray-300 bg-white flex justify-between items-center">
          <span className="text-[1vw] text-gray-700">
            {isJourneyComplete ||
            (isStorekeeperMode && step >= storekeeperAgents.length)
              ? "All steps executed."
              : userSelectedMode === "storekeeper"
              ? `Step ${step} of 3`
              : `Step ${step} of 6`}
          </span>

          {!(
            isJourneyComplete ||
            (isStorekeeperMode && step >= storekeeperAgents.length)
          ) && (
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isStorekeeperMode
                  ? "Click 'Search' to continue to next agent..."
                  : userSelectedMode === "storekeeper"
                  ? "Enter Product ID (e.g., p001, p002)..."
                  : "Enter Query or Product ID (e.g., p001)..."
              }
              className="p-2 bg-white border border-gray-300 rounded text-[1vw] min-w-[60%] text-gray-800"
            />
          )}

          <button
            onClick={() => {
              if (isStorekeeperMode) {
                nextStorekeeperAgent();
              } else {
                // Check mode and query type
                if (userSelectedMode === "storekeeper") {
                  // In storekeeper mode, expect product ID
                  const productIdPattern = /^p\d+$/i;
                  if (productIdPattern.test(query.trim())) {
                    searchByProductId(query);
                  } else {
                    alert("Please enter a valid Product ID (e.g., p001, p002)");
                  }
                } else {
                  // In customer mode, use regular flow
                  nextAgent();
                }
              }
            }}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-[1vw] flex items-center gap-2 font-bold transition-all shadow-md ${
              isLoading
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white hover:shadow-lg hover:scale-105"
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading
              ? "Processing..."
              : isJourneyComplete ||
                (isStorekeeperMode && step >= storekeeperAgents.length)
              ? "Restart"
              : "Search"}
          </button>
        </div>
      </div>
    </div>
  );
}
