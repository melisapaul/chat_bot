import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Mic,
  Send,
  Globe,
  Phone,
  MessageSquare,
  X,
} from "lucide-react";

export default function MessengerChatbot({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [channel, setChannel] = useState("web");
  const [isTyping, setIsTyping] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [productRound, setProductRound] = useState(1); // Track which set of products to show
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null); // Track selected payment method
  const [paymentAttempt, setPaymentAttempt] = useState(1); // Track payment attempt number
  const [showPaymentFailure, setShowPaymentFailure] = useState(false); // Show payment failure popup
  const messagesEndRef = useRef(null);
  const timelineEndRef = useRef(null);
  const hasInitialized = useRef(false);
  const MIN_AGENT_DELAY = 2000;
  const MAX_AGENT_DELAY = 5000;

  const getRandomAgentDelay = (min = MIN_AGENT_DELAY, max = MAX_AGENT_DELAY) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  let agentTimelineOffset = 0;
  let agentTimelineAnchor = Date.now();

  const resetAgentDelay = () => {
    agentTimelineOffset = 0;
    agentTimelineAnchor = Date.now();
  };

  const delay = (step = 1) => {
    const increments = Math.max(1, Math.round(step));
    for (let i = 0; i < increments; i += 1) {
      agentTimelineOffset += getRandomAgentDelay();
    }
    const targetTime = agentTimelineAnchor + agentTimelineOffset;
    const now = Date.now();
    const relativeDelay = targetTime - now;
    return relativeDelay > 0 ? relativeDelay : MIN_AGENT_DELAY;
  };

  const channels = [
    { value: "web", label: "Web", icon: Globe },
    { value: "phone", label: "Phone", icon: Phone },
    { value: "chat", label: "Chat", icon: MessageSquare },
  ];

  useEffect(() => {
    // Initial greeting with agent logs - only run once
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      addAgentLog("System", "SalesAgent", "Session initiated");
      addAgentMessage(
        "Hi Arjun! I’m your Sales Agent.With winter setting in and Christmas around the corner 🎄, I can help you explore our winter collection or find the perfect festive outfit. What are you looking for today?",
        [], // No quick replies - user will type manually
        { title: "Sales Agent", id: "sales_agent" }
      );
      addAgentLog("SalesAgent", "User", "Greeting sent, awaiting user query");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentLogs]);

  const addAgentLog = (from, to, message) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    setAgentLogs((prev) => [...prev, { from, to, message, timestamp }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text, timestamp: new Date() },
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
        timestamp: new Date(),
        agentInfo,
      },
    ]);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addUserMessage(inputValue);
      setInputValue("");

      // Simulate agent response
      setIsTyping(true);
      resetAgentDelay();
      setTimeout(() => {
        setIsTyping(false);
        handleAgentResponse(inputValue);
      }, delay(1.2));
    }
  };

  const handleAgentResponse = (userMessage) => {
    resetAgentDelay();
    const lowerMsg = userMessage.toLowerCase();

    if (
      lowerMsg.includes("shirt") ||
      lowerMsg.includes("clothing") ||
      lowerMsg.includes("product")
    ) {
      addAgentLog(
        "SalesAgent",
        "RecommendationAgent",
        `find shirts price<=3000, color:any, query:"${userMessage}"`
      );
      setTimeout(() => {
        addAgentLog(
          "RecommendationAgent",
          "Database",
          "Searching product catalog..."
        );
      }, delay(0.25));
      setTimeout(() => {
        addAgentLog(
          "Database",
          "RecommendationAgent",
          "6 SKUs found [SKU101:Louis Philippe, SKU205:Raymond, SKU333:Peter England, SKU401:Van Heusen, SKU502:Arrow, SKU603:Adidas]"
        );
        addAgentLog(
          "RecommendationAgent",
          "SalesAgent",
          "First 3 products matched, returning recommendations. Type 'show more' for additional options."
        );
      }, delay(0.5));
      setTimeout(() => {
        setIsTyping(false);
        // Show first round of products only
        setProductRound(1);
        setMessages((prev) => [
          ...prev,
          {
            type: "products",
            timestamp: new Date(),
            round: 1,
            agentInfo: {
              title: "Recommendation Agent",
              id: "recommendation_agent",
            },
          },
        ]);
      }, delay(0.7));
    } else if (
      lowerMsg.includes("show more") ||
      lowerMsg.includes("more product") ||
      lowerMsg.includes("show me more")
    ) {
      addAgentLog(
        "SalesAgent",
        "RecommendationAgent",
        "Fetching additional product recommendations..."
      );
      setTimeout(() => {
        addAgentLog(
          "RecommendationAgent",
          "Database",
          "Fetching additional recommendations..."
        );
      }, delay(0.25));
      setTimeout(() => {
        addAgentLog(
          "Database",
          "RecommendationAgent",
          "Additional 3 SKUs prepared [SKU401:Van Heusen, SKU502:Arrow, SKU603:Adidas]"
        );
        addAgentLog(
          "RecommendationAgent",
          "SalesAgent",
          "Second batch of products ready"
        );
      }, delay(0.5));
      setTimeout(() => {
        setIsTyping(false);
        // Show second round of products
        setProductRound(2);
        setMessages((prev) => [
          ...prev,
          {
            type: "products",
            timestamp: new Date(),
            round: 2,
            agentInfo: {
              title: "Recommendation Agent",
              id: "recommendation_agent",
            },
          },
        ]);
        setTimeout(() => {
          addAgentMessage(
            "Customers who bought this shirt also liked a Titan belt. Would u like to see the product?",
            ["Yes, show the Titan belt", "No, maybe later"],
            { title: "Recommendation Agent", id: "recommendation_agent" }
          );
        }, delay(0.2));
      }, delay(0.7));
    } else if (lowerMsg.includes("price") || lowerMsg.includes("cost")) {
      addAgentLog(
        "SalesAgent",
        "RecommendationAgent",
        "Query price range for shirts"
      );
      setTimeout(() => {
        addAgentLog(
          "RecommendationAgent",
          "SalesAgent",
          "Price range: ₹1,699-₹2,850"
        );
      }, delay(0.3));
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
    resetAgentDelay();
    addUserMessage(reply);
    setIsTyping(true);

    if (reply === "Check Availability") {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      addAgentLog(
        "SalesAgent",
        "InventoryAgent",
        "check Raymond Shirt size 40 near Mumbai"
      );
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent",
          "StoreDB",
          "Query stores in Kolkata region with size 40"
        );
      }, delay(1));
      setTimeout(() => {
        addAgentLog(
          "StoreDB",
          "InventoryAgent",
          "Found: Online(12), South City Mall(3), City Centre(0)"
        );
        addAgentLog(
          "InventoryAgent",
          "SalesAgent",
          "Stock data ready for display"
        );
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: "inventory",
            timestamp: new Date(),
            agentInfo: { title: "Inventory Agent", id: "inventory_agent" },
          },
        ]);
      }, delay(2));
    } else if (reply === "Reserve in Store") {
      addAgentLog("User", "PaymentAgent", `Selected: ${reply}`);
      setTimeout(() => {
        addAgentLog(
          "PaymentAgent",
          "InventoryAgent",
          "Check store availability for in-store pickup"
        );
        addAgentLog(
          "InventoryAgent",
          "StoreDB",
          "Query available stores with stock"
        );
        setIsTyping(true);
      }, delay(1));
      setTimeout(() => {
        addAgentLog(
          "StoreDB",
          "InventoryAgent",
          "Store inventory data retrieved"
        );
        addAgentLog(
          "InventoryAgent",
          "User",
          "Presenting available store locations"
        );
        setIsTyping(false);
        addAgentMessage(
          "Inventory checked! Choose Buy Online or nearest store.",
          [],
          { title: "Inventory Agent", id: "inventory_agent" },
          "inventory"
        );
      }, delay(2));
    } else if (reply === "Nearest Store") {
      addAgentLog("User", "InventoryAgent", `Selected: ${reply}`);
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent",
          "StoreDB",
          "Querying nearby store locations and availability"
        );
        addAgentLog(
          "StoreDB",
          "InventoryAgent",
          "Store location data retrieved"
        );
        setIsTyping(true);
      }, delay(1));
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent",
          "User",
          "Displaying store selection options"
        );
        setIsTyping(false);
        addAgentMessage(
          "Inventory checked! Choose Buy Online or nearest store.",
          [],
          { title: "Inventory Agent", id: "inventory_agent" },
          "store-selection"
        );
      }, delay(2));
    } else if (reply === "Yes, show the Titan belt") {
      addAgentLog("User", "SalesAgent", "Interested in Titan belt upsell");
      setTimeout(() => {
        addAgentLog(
          "SalesAgent",
          "RecommendationAgent",
          "Prepare Titan belt highlight"
        );
      }, delay(0.6));
      setTimeout(() => {
        addAgentLog(
          "RecommendationAgent",
          "SalesAgent",
          "Titan belt highlight ready"
        );
        setIsTyping(false);
        addAgentMessage(
          "The Titan belt pairs perfectly with your shirt. Want me to add it to your cart?",
          ["Add Belt to Cart", "Maybe Later"],
          { title: "Recommendation Agent", id: "recommendation_agent" }
        );
      }, delay(1.3));
    } else if (reply === "No, maybe later") {
      addAgentLog("User", "SalesAgent", "Declined Titan belt upsell");
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "No problem! I'll keep the Titan belt noted if you want it later.",
          ["Proceed with Shirts", "Browse Accessories"],
          { title: "Sales Agent", id: "sales_agent" }
        );
      }, delay(0.9));
    } else if (reply === "South City Mall (3 pcs)") {
      addAgentLog("User", "SalesAgent", `Selected: South City Mall`);
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "Done! Reserving your shirt for pickup at South City Mall… ⏳",
          [],
          { title: "Sales Agent", id: "sales_agent" }
        );
        addAgentLog(
          "SalesAgent",
          "InventoryAgent",
          "Reserve Raymond Shirt size 40 at South City Mall"
        );
      }, delay(1));
      setTimeout(() => {
        setIsTyping(true);
        addAgentLog(
          "InventoryAgent",
          "StoreDB",
          "Creating reservation for Arjun at South City Mall"
        );
      }, delay(2));
      setTimeout(() => {
        addAgentLog(
          "StoreDB",
          "InventoryAgent",
          "Reservation confirmed: ID #RSV12345"
        );
        addAgentLog(
          "InventoryAgent",
          "SalesAgent",
          "Pickup ready - valid 24hrs"
        );
        setIsTyping(false);
        addAgentMessage(
          "✅ Reserved successfully!\n\nReservation ID: #RSV12345\nStore: South City Mall, Third Floor (3.2 km away)\nValid for: 24 hours\n\nWould you like to complete the purchase now or pay at store?",
          ["Pay Now", "Pay at Store", "Get Directions"],
          { title: "Sales Agent", id: "sales_agent" }
        );
      }, delay(3));
    } else if (reply === "Add to Cart") {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      setTimeout(() => {
        addAgentLog("SalesAgent", "PaymentAgent", "Add Raymond Shirt to cart");
        addAgentLog("PaymentAgent", "CartDB", "Update cart for user Arjun");
        setIsTyping(false);
        addAgentMessage(
          "✅ Added to cart!\n\nRaymond Shirt (Size 40) - ₹1,789\n\nYour cart: 1 item\n\nWould you like to continue shopping or proceed to checkout?",
          ["Checkout Now", "Continue Shopping", "View Cart"],
          { title: "Payment Agent", id: "payment_agent" }
        );
      }, delay(2));
    } else if (reply === "Checkout Now" || reply === "Pay Now") {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      setTimeout(() => {
        addAgentLog("SalesAgent", "PaymentAgent", "Initiate payment flow");
        addAgentLog("PaymentAgent", "User", "Display payment options");
        setIsTyping(false);
        addAgentMessage(
          "Choose your payment method:\n\nTotal amount: ₹1,789\nDelivery: ₹0 (Free)\n━━━━━━━━━━━━\nGrand Total: ₹1,789",
          ["UPI", "Credit/Debit Card", "Cash on Delivery"],
          { title: "Payment Agent", id: "payment_agent" }
        );
      }, delay(2));
    } else if (reply === "UPI") {
      addAgentLog("User", "PaymentAgent", `Selected payment: ${reply}`);
      setTimeout(() => {
        addAgentLog(
          "PaymentAgent",
          "PaymentGateway",
          "Generate UPI payment link"
        );
        addAgentLog("PaymentGateway", "PaymentAgent", "Payment link ready");
        setIsTyping(false);
        if (paymentAttempt === 2) {
          // Second attempt - show UPI form for success
          addAgentLog("User", "PaymentAgent-2", "Selected UPI payment method");
          addAgentLog(
            "PaymentAgent-2",
            "UPI-Gateway",
            "Establishing secure UPI connection"
          );
          addAgentMessage(
            "UPI Payment - Second Attempt\n\nLet's try with UPI for a secure payment:",
            [],
            { title: "Payment Agent (Retry)", id: "payment_agent_2" },
            "payment"
          );
          setSelectedPaymentMethod("UPI-Second");
        } else {
          // First attempt - regular UPI
          addAgentMessage(
            "💳 UPI Payment\n\nScan QR code or use UPI ID:\nabfrl@paytm\n\nAmount: ₹1,879\n\nWaiting for payment confirmation...",
            ["Payment Done", "Try Other Method"],
            { title: "Payment Agent", id: "payment_agent" }
          );
        }
      }, delay(2));
    } else if (reply === "Debit Card") {
      addAgentLog("User", "PaymentAgent", `Selected payment: ${reply}`);
      setTimeout(() => {
        addAgentLog(
          "PaymentAgent",
          "PaymentGateway",
          "Setup debit card payment"
        );
        setIsTyping(false);
        addAgentMessage(
          "Debit Card Payment Selected:",
          [],
          { title: "Payment Agent", id: "payment_agent" },
          "payment"
        );
        setSelectedPaymentMethod("Debit Card");
      }, delay(2));
    } else if (reply === "Payment Done") {
      addAgentLog("User", "PaymentAgent", "Payment confirmation received");

      // Show payment success message for second attempt
      if (paymentAttempt === 2) {
        setTimeout(() => {
          addAgentLog(
            "UPI-Gateway",
            "PaymentAgent-2",
            "Payment verification successful"
          );
          addAgentLog(
            "PaymentAgent-2",
            "User",
            "Payment confirmed and processed"
          );
          // Payment success message removed as requested
        }, delay(1));
      }

      const verifyStep = paymentAttempt === 2 ? 2 : 1;
      const confirmStep = verifyStep + 1;

      setTimeout(() => {
        setIsTyping(true);
        addAgentLog("PaymentAgent", "PaymentGateway", "Verify payment status");
      }, delay(verifyStep));
      setTimeout(() => {
        addAgentLog(
          "PaymentGateway",
          "PaymentAgent",
          "Payment verified: ₹1,879 received"
        );
        addAgentLog(
          "PaymentAgent",
          "FulfillmentAgent",
          "Order confirmed - prepare for dispatch"
        );

        // Store online purchase in sessionStorage for UserJourney to display
        const purchaseData = {
          orderId: "#ORD789456",
          product: {
            id: "p004", // Allen Solly product ID from admin.json
            name: "Allen Solly Shirt",
            price: "1,999",
            size: "40",
            color: "Blue",
          },
          amount: "₹1,999",
          paymentMethod: selectedPaymentMethod || "UPI",
          timestamp: new Date().toISOString(),
          type: "online",
        };
        sessionStorage.setItem(
          "newOnlinePurchase",
          JSON.stringify(purchaseData)
        );

        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: "fulfillment",
            timestamp: new Date(),
            agentInfo: { title: "Fulfillment Agent", id: "fulfillment_agent" },
          },
        ]);

        // Auto-trigger Loyalty Agent after fulfillment
        setTimeout(() => {
          addAgentLog(
            "FulfillmentAgent",
            "LoyaltyAgent",
            "Order completed - processing loyalty rewards"
          );
          addAgentLog(
            "LoyaltyAgent",
            "RewardsDB",
            "Calculate loyalty points for order #ORD789456"
          );
        }, delay(2));

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
          setMessages((prev) => [
            ...prev,
            {
              type: "loyalty",
              timestamp: new Date(),
              agentInfo: { title: "Loyalty Agent", id: "loyalty_agent" },
            },
          ]);

          // Auto-trigger Post Purchase Agent after loyalty
          setTimeout(() => {
            addAgentLog(
              "LoyaltyAgent",
              "PostPurchaseAgent",
              "Loyalty processing complete - initiating post-purchase services"
            );
            addAgentLog(
              "PostPurchaseAgent",
              "ServiceDB",
              "Setup post-purchase services for order #ORD789456"
            );
          }, delay(1));

          setTimeout(() => {
            addAgentLog(
              "ServiceDB",
              "PostPurchaseAgent",
              "Services activated: Return policy, shipment tracking, feedback system"
            );
            addAgentLog(
              "PostPurchaseAgent",
              "User",
              "Post-purchase support ready and available"
            );
            setMessages((prev) => [
              ...prev,
              {
                type: "post-purchase",
                timestamp: new Date(),
                agentInfo: {
                  title: "Post Purchase Agent",
                  id: "post_purchase_agent",
                },
              },
            ]);
          }, delay(2));
        }, delay(3));
      }, delay(confirmStep));
    } else if (reply === "Ship to Home") {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      setTimeout(() => {
        addAgentLog(
          "SalesAgent",
          "PaymentAgent",
          "Initiate checkout for home delivery"
        );
        setIsTyping(false);
        setSelectedPaymentMethod(null); // Reset payment method selection
        setMessages((prev) => [
          ...prev,
          {
            type: "payment",
            timestamp: new Date(),
            agentInfo: { title: "Payment Agent", id: "payment_agent" },
          },
        ]);
      }, delay(0.8));
    } else if (reply.includes("Kolkata") || reply.includes("Mall")) {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      setTimeout(() => {
        addAgentLog(
          "SalesAgent",
          "InventoryAgent",
          "check SKU101 near pin 700001"
        );
        addAgentLog(
          "InventoryAgent",
          "StoreDB",
          "Query stores in Kolkata region"
        );
      }, delay(0.3));
      setTimeout(() => {
        addAgentLog(
          "StoreDB",
          "InventoryAgent",
          "Found: 3 stores with stock data"
        );
        addAgentLog(
          "InventoryAgent",
          "SalesAgent",
          "SKU101 → City Centre (Available:5), South Mall (Limited:2), Online (12)"
        );
        setIsTyping(false);
        addAgentMessage(
          "Checking inventory at nearby stores...",
          ["Kolkata City Centre", "South Mall Store", "Buy Online"],
          { title: "Inventory Agent", id: "inventory_agent" }
        );
      }, delay(0.9));
    } else if (reply === "Pay at Store") {
      addAgentLog("User", "PaymentAgent", `Selected: ${reply}`);
      setTimeout(() => {
        addAgentLog(
          "PaymentAgent",
          "FulfillmentAgent",
          "Confirm pay-at-store reservation"
        );
        setIsTyping(false);
        addAgentMessage(
          "✅ Confirmed!\n\nYou can pay when you pick up at South City Mall.\n\nReservation Details:\n• ID: #RSV12345\n• Valid: 24 hours\n• Amount: ₹1,789\n\nWe'll send you directions and store contact details.",
          ["Get Directions", "Call Store", "Done"],
          { title: "Fulfillment Agent", id: "fulfillment_agent" }
        );
      }, delay(0.8));
    } else if (reply === "Get Directions") {
      addAgentLog("User", "FulfillmentAgent", `Selected: ${reply}`);
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "📍 Directions to South City Mall\n\nAddress: South City Mall, Third Floor\nPrince Anwar Shah Rd, Kolkata\n\nDistance: 3.2 km (8 mins drive)\n\nStore Contact: +91 98765 43210\n\nOpening Hours: 10 AM - 10 PM",
          ["Open in Maps", "Call Store", "Done"],
          { title: "Fulfillment Agent", id: "fulfillment_agent" }
        );
      }, delay(0.6));
    } else if (reply === "Track Order") {
      addAgentLog("User", "PostPurchaseAgent-2", `Selected: ${reply}`);
      setTimeout(() => {
        addAgentLog(
          "PostPurchaseAgent-2",
          "TrackingSystem",
          "Accessing order tracking for #ORD789456"
        );
        addAgentLog(
          "TrackingSystem",
          "LogisticsDB",
          "Query real-time shipment status"
        );
        setIsTyping(true);
      }, delay(0.3));
      setTimeout(() => {
        addAgentLog(
          "LogisticsDB",
          "PostPurchaseAgent-2",
          "Live tracking data retrieved successfully"
        );
        addAgentLog(
          "PostPurchaseAgent-2",
          "User",
          "Presenting detailed tracking information"
        );
        setIsTyping(false);
        addAgentMessage(
          "📦 Order Tracking: #ORD789456\n\n✅ Payment Confirmed\n✅ Order Processed\n✅ Packed & Ready\n🚚 Out for Delivery\n\nExpected Delivery: Tomorrow by 6 PM\n\nCarrier: BlueDart Express\nTracking ID: BD789456123\n\n📍 Current Location: In Transit to Delhi\n🚛 Last Update: 2 hours ago",
          ["Track Live Location", "Contact Delivery Agent", "Done"],
          {
            title: "Post Purchase Agent (Tracking)",
            id: "post_purchase_agent_2",
          },
          "tracking"
        );
      }, delay(1.1));
    } else if (reply === "View Invoice") {
      addAgentLog("User", "PaymentAgent", `Selected: ${reply}`);
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "📄 Invoice #INV789456\n\nOrder ID: #ORD789456\n━━━━━━━━━━━━━━━━━\nRaymond Shirt (Size 40)\n₹1,789 × 1 = ₹1,789\n\nDelivery Charges: ₹0\nGST (18%): ₹322\n━━━━━━━━━━━━━━━━━\nTotal Paid: ₹2,111\n\nPayment Method: UPI\nDate: " +
            new Date().toLocaleDateString() +
            "\n\nInvoice sent to your email!",
          ["Download PDF", "Email Invoice", "Done"],
          { title: "Payment Agent", id: "payment_agent" }
        );
      }, delay(0.6));
    } else if (reply === "ABFRL Store South City") {
      addAgentLog(
        "User",
        "InventoryAgent (In-Store)",
        `Selected store: ${reply}`
      );
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent (In-Store)",
          "StoreDB",
          "Validating in-store inventory for ABFRL South City"
        );
        addAgentLog(
          "StoreDB",
          "InventoryAgent (In-Store)",
          "Stock confirmed: Size 40 available with Manager Sophia"
        );
        setIsTyping(true);
      }, delay(0.3));
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent (In-Store)",
          "FulfillmentAgent",
          "Store selection confirmed - initiating in-store fulfillment"
        );
        addAgentLog(
          "FulfillmentAgent",
          "System",
          "Generating session details for store handoff"
        );
      }, delay(0.8));
      setTimeout(() => {
        addAgentLog(
          "System",
          "FulfillmentAgent",
          "Channel switching from online to in-store kiosk"
        );
        addAgentLog(
          "FulfillmentAgent",
          "User",
          "Session transfer complete - ready for in-store assistance"
        );
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: "store-handoff",
            timestamp: new Date(),
            agentInfo: { title: "Fulfillment Agent", id: "fulfillment_agent" },
            storeData: {
              sessionId: "#SESSION789456",
              customerName: "Arjun Bose",
              customerId: "#00001",
              product: "Louis Philippe",
              size: "40 (Medium)",
              color: "White",
              sku: "LP-WH-40-001",
              price: "₹2,199",
              storeName: "ABFRL Store South City",
              manager: "Sophia",
              status: "Available",
            },
          },
        ]);

        // Store a hardcoded completed transaction for StoreKeeper (transient)
        // This is intentionally hardcoded so it appears in StoreKeeper and
        // will be removed on refresh (sessionStorage).
        sessionStorage.setItem(
          "newOfflineOrder",
          JSON.stringify({
            // exact timestamp requested for pending ID
            timestamp: "2025-12-14T14:22:46.238Z",
            date: "2025-12-14",
            sessionId: "#SESSION789456",
            userName: "Arjun Bose",
            userId: "#0001",
            product: {
              id: "p004",
              name: "Louis Philippe",
              size: "40 (Medium)",
              color: "White",
              sku: "LP-WH-40-001",
              // numeric amount for table rendering
              price: 2199,
            },
            store: {
              id: "sk1",
              store_name: "ABFRL South City Store",
              manager: "Sophia",
              status: "Available",
            },
            orderStatus: "In Progress",
            userAddress: "29 Main Street, City 9",
            userPhone: "555-1029",
          })
        );
      }, delay(1.4));
    } else if (reply === "City Centre Salt Lake") {
      addAgentLog(
        "User",
        "InventoryAgent (In-Store)",
        `Selected store: ${reply}`
      );
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent (In-Store)",
          "StoreDB",
          "Validating in-store inventory for City Centre Salt Lake"
        );
        addAgentLog(
          "StoreDB",
          "InventoryAgent (In-Store)",
          "Stock confirmed: Size 40 available with Manager Rahul"
        );
        setIsTyping(true);
      }, delay(0.3));
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent (In-Store)",
          "FulfillmentAgent",
          "Store selection confirmed - initiating in-store fulfillment"
        );
        addAgentLog(
          "FulfillmentAgent",
          "System",
          "Generating session details for store handoff"
        );
      }, delay(0.8));
      setTimeout(() => {
        addAgentLog(
          "System",
          "FulfillmentAgent",
          "Channel switching from online to in-store kiosk"
        );
        addAgentLog(
          "FulfillmentAgent",
          "User",
          "Session transfer complete - ready for in-store assistance"
        );
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: "store-handoff",
            timestamp: new Date(),
            agentInfo: { title: "Fulfillment Agent", id: "fulfillment_agent" },
            storeData: {
              sessionId: "#SESSION789456",
              customerName: "Arjun Bose",
              customerId: "#00001",
              product: "Louis Philippe",
              size: "40 (Medium)",
              color: "White",
              sku: "LP-WH-40-001",
              price: "₹2,199",
              storeName: "City Centre Salt Lake, First Floor",
              manager: "Rahul",
              status: "Available",
            },
          },
        ]);

        // Store order details for StoreKeeper notification
        sessionStorage.setItem(
          "newOfflineOrder",
          JSON.stringify({
            sessionId: "#SESSION789456",
            userName: "Arjun Bose",
            userId: "#00001",
            product: {
              name: "Louis Philippe",
              size: "40 (Medium)",
              color: "White",
              sku: "LP-WH-40-001",
              price: "₹2,199",
            },
            store: {
              location: "City Centre Salt Lake, First Floor",
              manager: "Rahul",
              status: "Available",
            },
            timestamp: new Date().toISOString(),
          })
        );
      }, delay(1.4));
    } else if (reply === "Quest Mall") {
      addAgentLog(
        "User",
        "InventoryAgent (In-Store)",
        `Selected store: ${reply}`
      );
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent (In-Store)",
          "StoreDB",
          "Validating in-store inventory for Quest Mall"
        );
        addAgentLog(
          "StoreDB",
          "InventoryAgent (In-Store)",
          "Stock status: Limited availability with Manager Priya"
        );
        setIsTyping(true);
      }, delay(0.3));
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent (In-Store)",
          "FulfillmentAgent",
          "Store selection confirmed - initiating in-store fulfillment"
        );
        addAgentLog(
          "FulfillmentAgent",
          "System",
          "Generating session details for store handoff"
        );
      }, delay(0.8));
      setTimeout(() => {
        addAgentLog(
          "System",
          "FulfillmentAgent",
          "Channel switching from online to in-store kiosk"
        );
        addAgentLog(
          "FulfillmentAgent",
          "User",
          "Session transfer complete - ready for in-store assistance"
        );
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: "store-handoff",
            timestamp: new Date(),
            agentInfo: { title: "Fulfillment Agent", id: "fulfillment_agent" },
            storeData: {
              sessionId: "#SESSION789456",
              customerName: "Arjun Bose",
              customerId: "#00001",
              product: "Louis Philippe",
              size: "40 (Medium)",
              color: "White",
              sku: "LP-WH-40-001",
              price: "₹2,199",
              storeName: "Quest Mall, Second Floor",
              manager: "Priya",
              status: "Limited Stock",
              warning: "Limited availability - reserve quickly",
            },
          },
        ]);

        // Store order details for StoreKeeper notification
        sessionStorage.setItem(
          "newOfflineOrder",
          JSON.stringify({
            sessionId: "#SESSION789456",
            userName: "Arjun Bose",
            userId: "#00001",
            product: {
              name: "Louis Philippe",
              size: "40 (Medium)",
              color: "White",
              sku: "LP-WH-40-001",
              price: "₹2,199",
            },
            store: {
              location: "Quest Mall, Second Floor",
              manager: "Priya",
              status: "Limited Stock",
            },
            timestamp: new Date().toISOString(),
          })
        );
      }, delay(1.4));
    } else if (reply === "South City Mall") {
      addAgentLog(
        "User",
        "InventoryAgent (In-Store)",
        `Selected store: ${reply}`
      );
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent (In-Store)",
          "StoreDB",
          "Validating in-store inventory for South City Mall"
        );
        addAgentLog(
          "StoreDB",
          "InventoryAgent (In-Store)",
          "Stock confirmed: Size 40 available with Manager Neha"
        );
        setIsTyping(true);
      }, delay(0.3));
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent (In-Store)",
          "FulfillmentAgent",
          "Store selection confirmed - initiating in-store fulfillment"
        );
        addAgentLog(
          "FulfillmentAgent",
          "System",
          "Generating session details for store handoff"
        );
      }, delay(0.8));
      setTimeout(() => {
        addAgentLog(
          "System",
          "FulfillmentAgent",
          "Channel switching from online to in-store kiosk"
        );
        addAgentLog(
          "FulfillmentAgent",
          "User",
          "Session transfer complete - ready for in-store assistance"
        );
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: "store-handoff",
            timestamp: new Date(),
            agentInfo: { title: "Fulfillment Agent", id: "fulfillment_agent" },
            storeData: {
              sessionId: "#SESSION789456",
              customerName: "Arjun Bose",
              customerId: "#00001",
              product: "Louis Philippe",
              size: "40 (Medium)",
              color: "White",
              sku: "LP-WH-40-001",
              price: "₹2,199",
              storeName: "South City Mall, Third Floor",
              manager: "Neha",
              status: "Available",
            },
          },
        ]);

        // Store order details for StoreKeeper notification
        sessionStorage.setItem(
          "newOfflineOrder",
          JSON.stringify({
            sessionId: "#SESSION789456",
            userName: "Arjun Bose",
            userId: "#00001",
            product: {
              name: "Louis Philippe",
              size: "40 (Medium)",
              color: "White",
              sku: "LP-WH-40-001",
              price: "₹2,199",
            },
            store: {
              location: "South City Mall, Third Floor",
              manager: "Neha",
              status: "Available",
            },
            timestamp: new Date().toISOString(),
          })
        );
      }, delay(1.4));
    } else if (reply === "Continue Shopping" || reply === "Done") {
      addAgentLog("User", "SalesAgent", `Selected: ${reply}`);
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "Thank you for shopping with us, Arjun! 🎉\n\nIs there anything else I can help you with today?",
          ["Browse More Products", "Check My Orders", "Contact Support"],
          { title: "Sales Agent", id: "sales_agent" }
        );
      }, delay(0.6));
    } else if (reply === "Credit/Debit Card" || reply === "Card") {
      addAgentLog("User", "PaymentAgent", `Selected payment: Card`);
      setTimeout(() => {
        addAgentLog(
          "PaymentAgent",
          "PaymentGateway",
          "Redirect to secure card payment"
        );
        setIsTyping(false);
        addAgentMessage(
          "Choose your card type for secure payment:",
          [],
          { title: "Payment Agent", id: "payment_agent" },
          "payment"
        );
        // Set to Credit Card for first attempt
        if (paymentAttempt === 1) {
          setSelectedPaymentMethod("Credit Card");
        } else {
          setSelectedPaymentMethod("Debit Card");
        }
      }, delay(0.8));
    } else if (reply === "Cash on Delivery") {
      addAgentLog("User", "PaymentAgent", `Selected payment: COD`);
      setTimeout(() => {
        addAgentLog(
          "PaymentAgent",
          "FulfillmentAgent",
          "Order confirmed - COD"
        );
        setIsTyping(false);
        addAgentMessage(
          "✅ Order Confirmed with Cash on Delivery!\n\nOrder ID: #ORD789457\nAmount to pay: ₹1,789\n\nDelivery: 2-3 business days\n\nPay cash when you receive the package. Keep exact change ready!",
          ["Track Order", "View Order Details", "Done"],
          { title: "Fulfillment Agent", id: "fulfillment_agent" }
        );
      }, delay(0.8));
    } else if (reply === "Add Belt to Cart") {
      addAgentLog("User", "SalesAgent", "Selected Titan belt add to cart");
      setTimeout(() => {
        addAgentLog(
          "SalesAgent",
          "PaymentAgent",
          "Add Titan Belt SKU TB-201 to cart"
        );
        addAgentLog(
          "PaymentAgent",
          "CartDB",
          "Update cart with Titan Belt"
        );
        setIsTyping(false);
        addAgentMessage(
          "✅ Titan Belt added to cart! It pairs perfectly with your shirt selection.",
          ["Checkout Now", "Continue Shopping", "View Cart"],
          { title: "Payment Agent", id: "payment_agent" }
        );
      }, delay(1));
    } else if (reply === "Maybe Later") {
      addAgentLog("User", "InventoryAgent", "Declined Titan belt add-to-cart");
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "No worries! The Titan belt will stay bookmarked if you change your mind.",
          ["Proceed with Shirts", "Browse Accessories"],
          { title: "Sales Agent", id: "sales_agent" }
        );
      }, delay(0.8));
    } else if (reply === "Proceed with Shirts") {
      addAgentLog("User", "SalesAgent", "Resume shirt journey after belt prompt");
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "Great! Just let me know which shirt you'd like to move forward with or if you'd like another recommendation.",
          ["Add to Cart", "Show More", "Need Assistance"],
          { title: "Sales Agent", id: "sales_agent" }
        );
      }, delay(0.8));
    } else if (reply === "Show More") {
      setTimeout(() => {
        setIsTyping(false);
        handleAgentResponse("show more");
      }, delay(0.8));
    } else if (reply === "Need Assistance") {
      addAgentLog("User", "SalesAgent", "Requested assistance after belt prompt");
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "I'm here to help! Tell me if you want size checks, more colors, or outfit suggestions.",
          ["Check Availability", "Suggest Colors", "Talk to Support"],
          { title: "Sales Agent", id: "sales_agent" }
        );
      }, delay(0.7));
    } else if (reply === "Browse Accessories") {
      addAgentLog("User", "InventoryAgent", "Requested more accessories");
      setTimeout(() => {
        addAgentLog(
          "InventoryAgent",
          "StoreDB",
          "Fetch complementary accessories"
        );
      }, delay(0.4));
      setTimeout(() => {
        addAgentLog(
          "StoreDB",
          "InventoryAgent",
          "Accessory list ready: Titan Belt, Leather Wallet, Classic Tie"
        );
        setIsTyping(false);
        addAgentMessage(
          "Here are a few accessories customers love: Titan Belt, Leather Wallet, Classic Tie.",
          ["Add Belt to Cart", "Add Wallet", "Back"],
          { title: "Inventory Agent", id: "inventory_agent" }
        );
      }, delay(1.1));
    } else if (reply === "Add Wallet") {
      addAgentLog("User", "SalesAgent", "Selected leather wallet accessory");
      setTimeout(() => {
        addAgentLog(
          "SalesAgent",
          "PaymentAgent",
          "Add Leather Wallet SKU LW-112 to cart"
        );
        addAgentLog(
          "PaymentAgent",
          "CartDB",
          "Update cart with Leather Wallet"
        );
        setIsTyping(false);
        addAgentMessage(
          "✅ Leather Wallet added to cart alongside your selections.",
          ["Checkout Now", "Continue Shopping"],
          { title: "Payment Agent", id: "payment_agent" }
        );
      }, delay(1));
    } else if (reply === "Back") {
      addAgentLog("User", "SalesAgent", "Returned from accessories list");
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "All set. Let me know if you'd like to move ahead with your shirts or revisit accessories anytime.",
          ["Proceed with Shirts", "Browse Accessories"],
          { title: "Sales Agent", id: "sales_agent" }
        );
      }, delay(0.7));
    } else if (reply === "Suggest Colors") {
      addAgentLog("User", "RecommendationAgent", "Requested color suggestions");
      setTimeout(() => {
        addAgentLog(
          "RecommendationAgent",
          "Database",
          "Fetch complementary color variants for selected shirts"
        );
      }, delay(0.4));
      setTimeout(() => {
        addAgentLog(
          "Database",
          "RecommendationAgent",
          "Color options ready: Navy, Sky Blue, Charcoal"
        );
        setIsTyping(false);
        addAgentMessage(
          "Here are trending colors that match your preferences: Navy, Sky Blue, and Charcoal.",
          ["Show Navy", "Show Sky Blue", "Show Charcoal"],
          { title: "Recommendation Agent", id: "recommendation_agent" }
        );
      }, delay(1.1));
    } else if (reply === "Talk to Support") {
      addAgentLog("User", "SalesAgent", "Escalating to support team");
      setTimeout(() => {
        addAgentLog(
          "SalesAgent",
          "SupportAgent",
          "Connect user for live assistance"
        );
      }, delay(0.3));
      setTimeout(() => {
        addAgentLog(
          "SupportAgent",
          "User",
          "Support agent ready to assist"
        );
        setIsTyping(false);
        addAgentMessage(
          "Connecting you with a support specialist now. They can help with sizing, delivery, or anything else.",
          ["Thanks", "Contact Later"],
          { title: "Support Agent", id: "support_agent" }
        );
      }, delay(0.9));
    } else if (
      reply === "Show Navy" ||
      reply === "Show Sky Blue" ||
      reply === "Show Charcoal"
    ) {
      const color = reply.replace("Show ", "");
      addAgentLog("User", "RecommendationAgent", `Requested ${color} variants`);
      setTimeout(() => {
        addAgentLog(
          "RecommendationAgent",
          "Database",
          `Fetch ${color} shirts availability`
        );
      }, delay(0.4));
      setTimeout(() => {
        addAgentLog(
          "Database",
          "RecommendationAgent",
          `${color} variants ready with latest stock`
        );
        setIsTyping(false);
        addAgentMessage(
          `${color} options are available in sizes 38-44. Want me to check store availability?`,
          ["Check Availability", "Add to Cart", "Maybe Later"],
          { title: "Recommendation Agent", id: "recommendation_agent" }
        );
      }, delay(1));
    } else if (reply === "Thanks") {
      addAgentLog("User", "SupportAgent", "Acknowledged support connection");
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "Happy to help! I'll stay here in case you need anything else.",
          ["Proceed with Shirts", "End Chat"],
          { title: "Support Agent", id: "support_agent" }
        );
      }, delay(0.6));
    } else if (reply === "Contact Later") {
      addAgentLog("User", "SupportAgent", "Requested later contact");
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "Sure thing! We'll keep the chat window active if you decide to reach out again.",
          ["Proceed with Shirts", "End Chat"],
          { title: "Support Agent", id: "support_agent" }
        );
      }, delay(0.6));
    } else if (reply === "End Chat") {
      addAgentLog("User", "SupportAgent", "Ended chat session");
      setTimeout(() => {
        setIsTyping(false);
        addAgentMessage(
          "Thanks for spending time with us today. You can reopen the assistant whenever you're ready.",
          [],
          { title: "Support Agent", id: "support_agent" }
        );
      }, delay(0.6));
    } else if (reply.includes("₹")) {
      addAgentLog("User", "SalesAgent", `Product selected: ${reply}`);
      setTimeout(() => {
        addAgentLog("SalesAgent", "PaymentAgent", "Initiate checkout flow");
        addAgentLog(
          "PaymentAgent",
          "SalesAgent",
          "Payment options ready: UPI, Cards, COD"
        );
        setIsTyping(false);
        addAgentMessage(
          "Customers who bought this shirt also liked a Titan belt.",
          [],
          { title: "Recommendation Agent", id: "recommendation_agent" }
        );
        addAgentMessage(
          "Great choice! How would you like to proceed?",
          ["Add to Cart", "Buy Now", "View Details"],
          { title: "Payment Agent", id: "payment_agent" }
        );
      }, delay(0.9));
    } else {
      // Handle unrecognized replies silently or log for debugging
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-orange-100 via-yellow-100 to-amber-100 font-sans text-[1.4vw] leading-relaxed tracking-wide">
      <div className="h-screen flex">
        {/* LEFT - Agent Timeline */}
        <div className="w-1/3 bg-white border-r border-orange-300 flex flex-col shadow-lg">
          <header className="min-h-[20%] max-h-[20%] p-5 border-b border-orange-300 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-lg flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-[2vw] font-extrabold text-white drop-shadow-lg flex items-center gap-3 tracking-tight">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 via-amber-200 to-yellow-300 text-orange-600 shadow-md">
                    ⚡
                  </span>
                  Agent Timeline
                </h1>
                <p className="text-[1vw] text-orange-50/95 mt-2 font-medium tracking-wide">
                  Live Orchestration Log
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 text-white text-[0.95vw] font-semibold shadow-lg border border-white/30 transition-transform hover:scale-[1.02]"
              >
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/15 text-white">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </span>
                Back
              </button>
            </div>
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
                    <p className="font-bold text-[1.25vw] text-gray-900">
                      Sales Agent
                    </p>
                    <span className="text-[0.8vw] bg-orange-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                      sales_agent
                    </span>
                  </div>
                  <p className="text-[0.85vw] text-gray-600 mb-2 font-medium">
                    Master Orchestrator
                  </p>

                  {/* Timeline logs for Sales Agent */}
                  <div className="mt-3 space-y-1 border-t border-orange-200 pt-2">
                    {agentLogs
                      .filter(
                        (log) =>
                          log.from === "SalesAgent" ||
                          log.to === "SalesAgent" ||
                          log.from === "System"
                      )
                      .slice(-3)
                      .map((log, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-[0.75vw] font-mono"
                        >
                          <span className="text-gray-400 min-w-[60px]">
                            {log.timestamp}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-orange-600 font-semibold">
                              {log.from}
                            </span>
                            <svg
                              className="w-3 h-3 text-orange-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-orange-600 font-semibold">
                              {log.to}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Recommendation Agent */}
              {agentLogs.some(
                (log) =>
                  log.from === "RecommendationAgent" ||
                  log.to === "RecommendationAgent"
              ) && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-amber-500 rounded-full shadow-md"></div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg border border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[1.25vw] text-gray-900">
                        Recommendation Agent
                      </p>
                      <span className="text-[0.8vw] bg-amber-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                        recommendation_agent
                      </span>
                    </div>

                    {/* Timeline logs */}
                    <div className="mt-2 space-y-1 border-t border-orange-200 pt-2">
                      {agentLogs
                        .filter(
                          (log) =>
                            log.from === "RecommendationAgent" ||
                            log.to === "RecommendationAgent"
                        )
                        .slice(-6)
                        .map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-[0.75vw] font-mono"
                          >
                            <span className="text-gray-400 min-w-[60px]">
                              {log.timestamp}
                            </span>
                            <div className="flex-1 text-gray-700">
                              {log.message}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Agent */}
              {agentLogs.some(
                (log) =>
                  log.from === "InventoryAgent" || log.to === "InventoryAgent"
              ) && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-green-500 rounded-full shadow-md"></div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg border border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[1.25vw] text-gray-900">
                        Inventory Agent
                      </p>
                      <span className="text-[0.8vw] bg-green-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                        inventory_agent
                      </span>
                    </div>

                    {/* Timeline logs */}
                    <div className="mt-2 space-y-1 border-t border-orange-200 pt-2">
                      {agentLogs
                        .filter(
                          (log) =>
                            log.from === "InventoryAgent" ||
                            log.to === "InventoryAgent" ||
                            log.from === "StoreDB" ||
                            log.to === "StoreDB"
                        )
                        .slice(-3)
                        .map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-[0.75vw] font-mono"
                          >
                            <span className="text-gray-400 min-w-[60px]">
                              {log.timestamp}
                            </span>
                            <div className="flex-1 text-gray-700">
                              {log.message}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Agent */}
              {agentLogs.some(
                (log) =>
                  log.from === "PaymentAgent" ||
                  log.to === "PaymentAgent" ||
                  log.from === "PaymentGateway" ||
                  log.to === "PaymentGateway"
              ) && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-red-500 rounded-full shadow-md"></div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg border border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[1.25vw] text-gray-900">
                        Payment Agent
                      </p>
                      <span className="text-[0.8vw] bg-red-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                        payment_agent
                      </span>
                    </div>

                    {/* Timeline logs */}
                    <div className="mt-2 space-y-1 border-t border-orange-200 pt-2">
                      {agentLogs
                        .filter(
                          (log) =>
                            log.from === "PaymentAgent" ||
                            log.to === "PaymentAgent" ||
                            log.from === "PaymentGateway" ||
                            log.to === "PaymentGateway" ||
                            log.from === "CartDB" ||
                            log.to === "CartDB" ||
                            // Include retry agent logs under the primary Payment Agent card
                            log.from === "PaymentAgent-2" ||
                            log.to === "PaymentAgent-2" ||
                            log.from === "UPI-Gateway" ||
                            log.to === "UPI-Gateway"
                        )
                        .slice(-3)
                        .map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-[0.75vw] font-mono"
                          >
                            <span className="text-gray-400 min-w-[60px]">
                              {log.timestamp}
                            </span>
                            <div className="flex-1 text-gray-700">
                              {log.message}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PaymentAgent-2 logs are merged into the primary Payment Agent card above */}

              {/* Fulfillment Agent */}
              {agentLogs.some(
                (log) =>
                  log.from === "FulfillmentAgent" ||
                  log.to === "FulfillmentAgent"
              ) && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-blue-500 rounded-full shadow-md"></div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg border border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[1.25vw] text-gray-900">
                        Fulfillment Agent
                      </p>
                      <span className="text-[0.8vw] bg-blue-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                        fulfillment_agent
                      </span>
                    </div>

                    {/* Timeline logs */}
                    <div className="mt-2 space-y-1 border-t border-orange-200 pt-2">
                      {agentLogs
                        .filter(
                          (log) =>
                            log.from === "FulfillmentAgent" ||
                            log.to === "FulfillmentAgent"
                        )
                        .slice(-3)
                        .map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-[0.75vw] font-mono"
                          >
                            <span className="text-gray-400 min-w-[60px]">
                              {log.timestamp}
                            </span>
                            <div className="flex-1 text-gray-700">
                              {log.message}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loyalty Agent */}
              {agentLogs.some(
                (log) =>
                  log.from === "LoyaltyAgent" || log.to === "LoyaltyAgent"
              ) && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-purple-500 rounded-full shadow-md"></div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg border border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[1.25vw] text-gray-900">
                        Loyalty Agent
                      </p>
                      <span className="text-[0.8vw] bg-purple-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                        loyalty_agent
                      </span>
                    </div>

                    {/* Timeline logs */}
                    <div className="mt-2 space-y-1 border-t border-orange-200 pt-2">
                      {agentLogs
                        .filter(
                          (log) =>
                            log.from === "LoyaltyAgent" ||
                            log.to === "LoyaltyAgent" ||
                            log.from === "RewardsDB" ||
                            log.to === "RewardsDB"
                        )
                        .slice(-3)
                        .map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-[0.75vw] font-mono"
                          >
                            <span className="text-gray-400 min-w-[60px]">
                              {log.timestamp}
                            </span>
                            <div className="flex-1 text-gray-700">
                              {log.message}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Post Purchase Agent */}
              {agentLogs.some(
                (log) =>
                  log.from === "PostPurchaseAgent" ||
                  log.to === "PostPurchaseAgent"
              ) && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-indigo-500 rounded-full shadow-md"></div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg border border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[1.25vw] text-gray-900">
                        Post Purchase Agent
                      </p>
                      <span className="text-[0.8vw] bg-indigo-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                        post_purchase_agent
                      </span>
                    </div>

                    {/* Timeline logs */}
                    <div className="mt-2 space-y-1 border-t border-orange-200 pt-2">
                      {agentLogs
                        .filter(
                          (log) =>
                            log.from === "PostPurchaseAgent" ||
                            log.to === "PostPurchaseAgent" ||
                            log.from === "ServiceDB" ||
                            log.to === "ServiceDB"
                        )
                        .slice(-3)
                        .map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-[0.75vw] font-mono"
                          >
                            <span className="text-gray-400 min-w-[60px]">
                              {log.timestamp}
                            </span>
                            <div className="flex-1 text-gray-700">
                              {log.message}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Post Purchase Agent 2 (Tracking) */}
              {agentLogs.some(
                (log) =>
                  log.from === "PostPurchaseAgent-2" ||
                  log.to === "PostPurchaseAgent-2"
              ) && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-3 w-3 bg-purple-500 rounded-full shadow-md"></div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-lg border border-purple-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[1.25vw] text-gray-900">
                        Post Purchase Agent 2
                      </p>
                      <span className="text-[0.8vw] bg-purple-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm">
                        post_purchase_agent_2
                      </span>
                    </div>

                    {/* Timeline logs */}
                    <div className="mt-2 space-y-1 border-t border-purple-200 pt-2">
                      {agentLogs
                        .filter(
                          (log) =>
                            log.from === "PostPurchaseAgent-2" ||
                            log.to === "PostPurchaseAgent-2" ||
                            log.from === "TrackingSystem" ||
                            log.to === "TrackingSystem" ||
                            log.from === "LogisticsDB" ||
                            log.to === "LogisticsDB"
                        )
                        .slice(-3)
                        .map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-[0.75vw] font-mono"
                          >
                            <span className="text-gray-400 min-w-[60px]">
                              {log.timestamp}
                            </span>
                            <div className="flex-1 text-gray-700">
                              {log.message}
                            </div>
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
                        {agentLogs.length > 0
                          ? agentLogs[agentLogs.length - 1].message
                          : "Agent Processing..."}
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
        <div className="w-2/3 flex flex-col bg-white">
          {/* Header */}
          <header className="min-h-[20%] max-h-[20%] p-5 border-b border-orange-300 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-3xl">🤖</span>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-[2vw] font-extrabold text-white drop-shadow-lg flex items-center tracking-tight">
                  AI Orchestrator
                </h1>
                <p className="text-[0.95vw] text-orange-100/95 mt-1 font-medium tracking-wide">
                  In-store multi-agent automation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-2xl border border-white/70 shadow-md">
                {React.createElement(
                  channels.find((c) => c.value === channel)?.icon || Globe,
                  { size: 18, color: "#DD5A08" }
                )}
                <span className="text-[0.95vw] font-semibold tracking-wide">
                  {channels.find((c) => c.value === channel)?.label || "Web"}
                </span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-white text-[0.95vw] font-semibold shadow-md border border-white/40">
                Status: <span className="font-extrabold">Active</span>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-white border border-white/30 shadow-md transition-transform hover:scale-105"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
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
                        <p className="text-[1vw] font-medium leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1 text-right">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : msg.type === "payment" ? (
                  // Payment Message with Styled Payment Methods
                  <div className="flex justify-start">
                    <div className="max-w-[95%] w-full">
                      <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm p-5 shadow-md">
                        {/* Agent header */}
                        <div className="text-[0.85vw] text-orange-600 mb-3 font-semibold tracking-wide">
                          {msg.agentInfo?.title || "Payment Agent"} •{" "}
                          {msg.agentInfo?.id || "payment_agent"}
                        </div>

                        {/* Payment Message */}
                        <div className="text-[0.95vw] text-gray-900 mb-3 font-medium leading-relaxed tracking-tight">
                          Great! Proceeding with home delivery from our online
                          warehouse.
                          <br />
                          <strong>Delivery to your address:</strong>
                          <br />
                          Sodepur, West Bengal
                          <br />
                          <strong>Estimated delivery:</strong> 2-3 business days
                          <br />
                          How would you like to pay?
                        </div>

                        {/* Dynamic Payment Interface */}
                        {!selectedPaymentMethod ? (
                          /* Payment Method Selection */
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <h3 className="font-extrabold text-[0.9vw] text-gray-800 tracking-tight mb-2">
                              Choose Payment Method
                            </h3>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setSelectedPaymentMethod("UPI")}
                                className="bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-md p-3 flex flex-col items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                              >
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">#</span>
                                </div>
                                <div className="font-bold text-[0.75vw] text-gray-800">
                                  UPI
                                </div>
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedPaymentMethod("Credit Card")
                                }
                                className="bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-md p-3 flex flex-col items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                              >
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">💳</span>
                                </div>
                                <div className="font-bold text-[0.75vw] text-gray-800">
                                  Credit Card
                                </div>
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedPaymentMethod("Debit Card")
                                }
                                className="bg-white hover:bg-green-50 border-2 border-green-200 hover:border-green-400 rounded-md p-3 flex flex-col items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                              >
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">💳</span>
                                </div>
                                <div className="font-bold text-[0.75vw] text-gray-800">
                                  Debit Card
                                </div>
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedPaymentMethod("Cash on Delivery")
                                }
                                className="bg-white hover:bg-orange-50 border-2 border-orange-200 hover:border-orange-400 rounded-md p-3 flex flex-col items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                              >
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">💵</span>
                                </div>
                                <div className="font-bold text-[0.75vw] text-gray-800">
                                  Cash on Delivery
                                </div>
                              </button>
                            </div>
                          </div>
                        ) : selectedPaymentMethod === "UPI" ? (
                          /* UPI Payment Form */
                          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                            <button
                              onClick={() => setSelectedPaymentMethod(null)}
                              className="text-orange-500 text-[0.8vw] mb-3 hover:underline"
                            >
                              ← Back to payment methods
                            </button>
                            <h3 className="font-extrabold text-[0.9vw] text-gray-800 tracking-tight mb-3">
                              Enter your UPI ID to complete payment
                            </h3>

                            <div className="bg-amber-100 rounded-md p-3">
                              <div className="text-[0.75vw] text-gray-600 mb-2">
                                Enter UPI ID
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="username@upi"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-[0.8vw]"
                                />
                                <button
                                  onClick={() =>
                                    handleQuickReply("Payment Done")
                                  }
                                  className="px-4 py-2 bg-orange-500 text-white rounded text-[0.8vw] font-semibold hover:bg-orange-600"
                                >
                                  Pay
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : selectedPaymentMethod === "UPI-Second" ? (
                          /* UPI Payment Form - Second Attempt (Success) */
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <button
                              onClick={() => setSelectedPaymentMethod(null)}
                              className="text-orange-500 text-[0.8vw] mb-3 hover:underline"
                            >
                              ← Back to payment methods
                            </button>
                            <h3 className="font-extrabold text-[0.9vw] text-gray-800 tracking-tight mb-3">
                              💳 Complete UPI Payment - Second Attempt
                            </h3>

                            <div className="bg-green-100 rounded-md p-3">
                              <div className="text-[0.75vw] text-gray-600 mb-2">
                                Enter UPI ID
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="username@paytm"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-[0.8vw]"
                                />
                                <button
                                  onClick={() => {
                                    // Second attempt with UPI - simulate success
                                    handleQuickReply("Payment Done");
                                  }}
                                  className="px-4 py-2 bg-green-500 text-white rounded text-[0.8vw] font-semibold hover:bg-green-600"
                                >
                                  Pay ₹1,879
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : selectedPaymentMethod === "Credit Card" ? (
                          /* Credit Card Payment Form */
                          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                            <button
                              onClick={() => setSelectedPaymentMethod(null)}
                              className="text-orange-500 text-[0.8vw] mb-3 hover:underline"
                            >
                              ← Back to payment methods
                            </button>
                            <h3 className="font-extrabold text-[0.9vw] text-gray-800 tracking-tight mb-3">
                              Enter Credit Card Details
                            </h3>

                            <div className="bg-amber-100 rounded-md p-3 space-y-3">
                              <div>
                                <div className="text-[0.75vw] text-gray-600 mb-1">
                                  Card Number
                                </div>
                                <input
                                  type="text"
                                  placeholder="1234 5678 9012 3456"
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-[0.8vw]"
                                />
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <div className="text-[0.75vw] text-gray-600 mb-1">
                                    Expiry Date
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-[0.8vw]"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="text-[0.75vw] text-gray-600 mb-1">
                                    CVV
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="123"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-[0.8vw]"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (paymentAttempt === 1) {
                                    // First attempt with Credit Card - simulate failure
                                    setShowPaymentFailure(true);
                                  } else {
                                    handleQuickReply("Payment Done");
                                  }
                                }}
                                className="w-full py-2 bg-orange-500 text-white rounded text-[0.8vw] font-semibold hover:bg-orange-600"
                              >
                                Pay Now
                              </button>
                            </div>
                          </div>
                        ) : selectedPaymentMethod === "Debit Card" ? (
                          /* Debit Card Payment Form */
                          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                            <button
                              onClick={() => setSelectedPaymentMethod(null)}
                              className="text-orange-500 text-[0.8vw] mb-3 hover:underline"
                            >
                              ← Back to payment methods
                            </button>
                            <h3 className="font-extrabold text-[0.9vw] text-gray-800 tracking-tight mb-3">
                              Enter Debit Card Details
                            </h3>

                            <div className="bg-amber-100 rounded-md p-3 space-y-3">
                              <div>
                                <div className="text-[0.75vw] text-gray-600 mb-1">
                                  Card Number
                                </div>
                                <input
                                  type="text"
                                  placeholder="1234 5678 9012 3456"
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-[0.8vw]"
                                />
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <div className="text-[0.75vw] text-gray-600 mb-1">
                                    Expiry Date
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-[0.8vw]"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="text-[0.75vw] text-gray-600 mb-1">
                                    CVV
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="123"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-[0.8vw]"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => handleQuickReply("Payment Done")}
                                className="w-full py-2 bg-orange-500 text-white rounded text-[0.8vw] font-semibold hover:bg-orange-600"
                              >
                                Pay Now
                              </button>
                            </div>
                          </div>
                        ) : selectedPaymentMethod === "Cash on Delivery" ? (
                          /* Cash on Delivery Confirmation */
                          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                            <button
                              onClick={() => setSelectedPaymentMethod(null)}
                              className="text-orange-500 text-[0.8vw] mb-3 hover:underline"
                            >
                              ← Back to payment methods
                            </button>
                            <h3 className="font-extrabold text-[0.9vw] text-gray-800 tracking-tight mb-3">
                              Cash on Delivery Selected
                            </h3>

                            <div className="bg-amber-100 rounded-md p-3">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                                  <span className="text-white text-xs">$</span>
                                </div>
                                <div>
                                  <div className="text-[0.8vw] font-semibold text-gray-800">
                                    Pay when you receive your order
                                  </div>
                                  <div className="text-[0.7vw] text-gray-600">
                                    No advance payment required
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  handleQuickReply("Cash on Delivery")
                                }
                                className="w-full py-2 bg-orange-500 text-white rounded text-[0.8vw] font-semibold hover:bg-orange-600"
                              >
                                Confirm Order
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : msg.type === "fulfillment" ? (
                  // Fulfillment Message with Delivery Scheduling
                  <div className="flex justify-start">
                    <div className="max-w-[95%] w-full">
                      <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm p-5 shadow-md">
                        {/* Agent header */}
                        <div className="text-[0.85vw] text-orange-600 mb-3 font-semibold tracking-wide">
                          {msg.agentInfo?.title || "Fulfillment Agent"} •{" "}
                          {msg.agentInfo?.id || "fulfillment_agent"}
                        </div>

                        {/* Success Message */}
                        <div className="text-gray-800 mb-5 text-[0.95vw] font-medium">
                          Your delivery has been scheduled!
                        </div>

                        {/* Payment Success Details */}
                        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white text-lg">🎉</span>
                            </div>
                            <div>
                              <h4 className="text-[1vw] font-bold text-gray-800">
                                Payment Successful!
                              </h4>
                              <p className="text-[0.8vw] text-gray-600">
                                Your order has been confirmed
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-3 border border-orange-100">
                              <div className="text-[0.7vw] text-gray-500 mb-1">
                                Order ID
                              </div>
                              <div className="text-[0.85vw] font-bold text-gray-800">
                                #ORD789456
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-orange-100">
                              <div className="text-[0.7vw] text-gray-500 mb-1">
                                Amount Paid
                              </div>
                              <div className="text-[0.85vw] font-bold text-green-600">
                                ₹1,879
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-orange-100">
                              <div className="text-[0.7vw] text-gray-500 mb-1">
                                Payment Method
                              </div>
                              <div className="text-[0.85vw] font-bold text-gray-800">
                                UPI
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-orange-100">
                              <div className="text-[0.7vw] text-gray-500 mb-1">
                                Delivery Time
                              </div>
                              <div className="text-[0.85vw] font-bold text-blue-600">
                                2-3 business days
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-orange-100">
                            <div className="flex items-center gap-2 text-[0.8vw] text-gray-700">
                              <span className="text-green-500">✓</span>
                              <span>
                                Order confirmed and will be dispatched soon
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : msg.type === "loyalty" ? (
                  // Loyalty Message with Rewards and Savings
                  <div className="flex justify-start">
                    <div className="max-w-[95%] w-full">
                      <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm p-5 shadow-md">
                        {/* Agent header */}
                        <div className="text-[0.85vw] text-orange-600 mb-3 font-semibold tracking-wide">
                          {msg.agentInfo?.title || "Loyalty Agent"} •{" "}
                          {msg.agentInfo?.id || "loyalty_agent"}
                        </div>

                        {/* Loyalty Success Message */}
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">🎁</span>
                            </div>
                            <div>
                              <h4 className="text-[0.9vw] font-bold text-purple-800">
                                Loyalty Rewards Applied!
                              </h4>
                              <p className="text-[0.75vw] text-purple-700">
                                Your rewards have been processed and applied
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Loyalty Features */}
                        <div className="space-y-3 mb-4">
                          <div className="text-[0.8vw] font-medium text-gray-700 mb-2">
                            🏆 Loyalty Benefits Applied:
                          </div>

                          <div className="flex items-center p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-md">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-[0.75vw] font-medium text-green-800">
                                Loyalty Points Earned
                              </span>
                              <p className="text-[0.65vw] text-green-600">
                                +120 points added to your account
                              </p>
                            </div>
                            <div className="text-[0.7vw] font-bold text-green-700">
                              120 pts
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-md">
                            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs">%</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-[0.75vw] font-medium text-orange-800">
                                Coupon Applied
                              </span>
                              <p className="text-[0.65vw] text-orange-600">
                                FIRST10 - 10% discount applied
                              </p>
                            </div>
                            <div className="text-[0.7vw] font-bold text-orange-700">
                              -₹120
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-md">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs">🎯</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-[0.75vw] font-medium text-blue-800">
                                Personalized Offer
                              </span>
                              <p className="text-[0.65vw] text-blue-600">
                                Free delivery on next 3 orders
                              </p>
                            </div>
                            <div className="text-[0.7vw] font-bold text-blue-700">
                              Unlocked
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : msg.type === "post-purchase" ? (
                  // Post Purchase Message with Support Services
                  <div className="flex justify-start">
                    <div className="max-w-[95%] w-full">
                      <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm p-5 shadow-md">
                        {/* Agent header */}
                        <div className="text-[0.85vw] text-orange-600 mb-3 font-semibold tracking-wide">
                          {msg.agentInfo?.title || "Post Purchase Agent"} •{" "}
                          {msg.agentInfo?.id || "post_purchase_agent"}
                        </div>

                        {/* Post Purchase Success Message */}
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">📞</span>
                            </div>
                            <div>
                              <h4 className="text-[0.9vw] font-bold text-indigo-800">
                                Post-Purchase Support Activated!
                              </h4>
                              <p className="text-[0.75vw] text-indigo-700">
                                We're here to help you throughout your journey
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Post Purchase Services */}
                        <div className="space-y-3 mb-4">
                          <div className="text-[0.8vw] font-medium text-gray-700 mb-2">
                            🛡️ Available Support Services:
                          </div>

                          <div className="flex items-center p-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-md">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs">↩️</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-[0.75vw] font-medium text-red-800">
                                Returns & Exchanges
                              </span>
                              <p className="text-[0.65vw] text-red-600">
                                30-day hassle-free return policy
                              </p>
                            </div>
                            <div className="text-[0.7vw] font-bold text-red-700">
                              Active
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-md">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs">📦</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-[0.75vw] font-medium text-blue-800">
                                Shipment Tracking
                              </span>
                              <p className="text-[0.65vw] text-blue-600">
                                Real-time delivery updates via SMS & email
                              </p>
                            </div>
                            <div className="text-[0.7vw] font-bold text-blue-700">
                              Enabled
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-md">
                            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs">⭐</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-[0.75vw] font-medium text-yellow-800">
                                Feedback System
                              </span>
                              <p className="text-[0.65vw] text-yellow-600">
                                Share your experience & earn reward points
                              </p>
                            </div>
                            <div className="text-[0.7vw] font-bold text-yellow-700">
                              Ready
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-md">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs">💬</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-[0.75vw] font-medium text-green-800">
                                24/7 Customer Support
                              </span>
                              <p className="text-[0.65vw] text-green-600">
                                Live chat, email & phone support available
                              </p>
                            </div>
                            <div className="text-[0.7vw] font-bold text-green-700">
                              Online
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-3">
                          <div className="text-[0.8vw] font-medium text-gray-700 mb-2">
                            🚀 Quick Actions:
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                addUserMessage("Track Order");
                                setTimeout(() => {
                                  setIsTyping(true);
                                }, 500);
                                setTimeout(() => {
                                  setIsTyping(false);
                                  addAgentMessage(
                                    "Your order tracking details",
                                    [],
                                    {
                                      title: "Post Purchase Agent",
                                      id: "post_purchase_agent",
                                    },
                                    "tracking"
                                  );
                                }, 1500);
                              }}
                              className="bg-white hover:bg-blue-50 rounded-md p-2 border border-gray-100 text-center transition-all hover:shadow-md hover:scale-105 cursor-pointer"
                            >
                              <div className="text-[0.7vw] text-blue-600 font-medium">
                                📱 Track Order
                              </div>
                              <div className="text-[0.6vw] text-gray-500">
                                Real-time updates
                              </div>
                            </button>
                            <div className="bg-white hover:bg-green-50 rounded-md p-2 border border-gray-100 text-center transition-all hover:shadow-md hover:scale-105 cursor-pointer">
                              <div className="text-[0.7vw] text-green-600 font-medium">
                                💬 Get Support
                              </div>
                              <div className="text-[0.6vw] text-gray-500">
                                Chat with us
                              </div>
                            </div>
                            <div className="bg-white hover:bg-orange-50 rounded-md p-2 border border-gray-100 text-center transition-all hover:shadow-md hover:scale-105 cursor-pointer">
                              <div className="text-[0.7vw] text-orange-600 font-medium">
                                ↩️ Return Item
                              </div>
                              <div className="text-[0.6vw] text-gray-500">
                                Easy returns
                              </div>
                            </div>
                            <div className="bg-white hover:bg-purple-50 rounded-md p-2 border border-gray-100 text-center transition-all hover:shadow-md hover:scale-105 cursor-pointer">
                              <div className="text-[0.7vw] text-purple-600 font-medium">
                                ⭐ Rate Order
                              </div>
                              <div className="text-[0.6vw] text-gray-500">
                                Share feedback
                              </div>
                            </div>
                          </div>
                          <div className="text-center text-[0.65vw] text-gray-600 font-medium mt-2">
                            📞 Need help? We're just one click away!
                          </div>
                        </div>
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : msg.type === "post-purchase" ? (
                  // Post Purchase Message with Support Services
                  <div className="flex justify-start">
                    <div className="max-w-[95%] w-full">
                      <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm p-5 shadow-md">
                        {/* Agent header */}
                        <div className="text-[0.85vw] text-orange-600 mb-3 font-semibold tracking-wide">
                          {msg.agentInfo?.title || "Post Purchase Agent"} •{" "}
                          {msg.agentInfo?.id || "post_purchase_agent"}
                        </div>

                        {/* Post Purchase Success Message */}
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">📞</span>
                            </div>
                            <div>
                              <h4 className="text-[0.9vw] font-bold text-indigo-800">
                                Post-Purchase Support Activated!
                              </h4>
                              <p className="text-[0.75vw] text-indigo-700">
                                We're here to help you throughout your journey
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Post Purchase Services */}
                        <div className="space-y-3 mb-4">
                          <div className="text-[0.8vw] font-medium text-gray-700 mb-2">
                            🛡️ Available Support Services:
                          </div>

                          <div className="flex items-center p-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-md">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs">↩️</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-[0.75vw] font-medium text-red-800">
                                Returns & Exchanges
                              </span>
                              <p className="text-[0.65vw] text-red-600">
                                30-day hassle-free return policy
                              </p>
                            </div>
                            <div className="text-[0.7vw] font-bold text-red-700">
                              Active
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-md">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs">📦</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-[0.75vw] font-medium text-blue-800">
                                Shipment Tracking
                              </span>
                              <p className="text-[0.65vw] text-blue-600">
                                Real-time delivery updates via SMS & email
                              </p>
                            </div>
                            <div className="text-[0.7vw] font-bold text-blue-700">
                              Enabled
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-md">
                            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs">⭐</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-[0.75vw] font-medium text-yellow-800">
                                Feedback System
                              </span>
                              <p className="text-[0.65vw] text-yellow-600">
                                Share your experience & earn reward points
                              </p>
                            </div>
                            <div className="text-[0.7vw] font-bold text-yellow-700">
                              Ready
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-md">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs">💬</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-[0.75vw] font-medium text-green-800">
                                24/7 Customer Support
                              </span>
                              <p className="text-[0.65vw] text-green-600">
                                Live chat, email & phone support available
                              </p>
                            </div>
                            <div className="text-[0.7vw] font-bold text-green-700">
                              Online
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-3">
                          <div className="text-[0.8vw] font-medium text-gray-700 mb-2">
                            🚀 Quick Actions:
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                addUserMessage("Track Order");
                                setTimeout(() => {
                                  setIsTyping(true);
                                }, 500);
                                setTimeout(() => {
                                  setIsTyping(false);
                                  addAgentMessage(
                                    "Your order tracking details",
                                    [],
                                    {
                                      title: "Post Purchase Agent",
                                      id: "post_purchase_agent",
                                    },
                                    "tracking"
                                  );
                                }, 1500);
                              }}
                              className="bg-white hover:bg-blue-50 rounded-md p-2 border border-gray-100 text-center transition-all hover:shadow-md hover:scale-105 cursor-pointer"
                            >
                              <div className="text-[0.7vw] text-blue-600 font-medium">
                                📱 Track Order
                              </div>
                              <div className="text-[0.6vw] text-gray-500">
                                Real-time updates
                              </div>
                            </button>
                            <div className="bg-white hover:bg-green-50 rounded-md p-2 border border-gray-100 text-center transition-all hover:shadow-md hover:scale-105 cursor-pointer">
                              <div className="text-[0.7vw] text-green-600 font-medium">
                                💬 Get Support
                              </div>
                              <div className="text-[0.6vw] text-gray-500">
                                Chat with us
                              </div>
                            </div>
                            <div className="bg-white hover:bg-orange-50 rounded-md p-2 border border-gray-100 text-center transition-all hover:shadow-md hover:scale-105 cursor-pointer">
                              <div className="text-[0.7vw] text-orange-600 font-medium">
                                ↩️ Return Item
                              </div>
                              <div className="text-[0.6vw] text-gray-500">
                                Easy returns
                              </div>
                            </div>
                            <div className="bg-white hover:bg-purple-50 rounded-md p-2 border border-gray-100 text-center transition-all hover:shadow-md hover:scale-105 cursor-pointer">
                              <div className="text-[0.7vw] text-purple-600 font-medium">
                                ⭐ Rate Order
                              </div>
                              <div className="text-[0.6vw] text-gray-500">
                                Share feedback
                              </div>
                            </div>
                          </div>
                          <div className="text-center text-[0.65vw] text-gray-600 font-medium mt-2">
                            📞 Need help? We're just one click away!
                          </div>
                        </div>
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : msg.type === "inventory" ? (
                  // Inventory Message with Styled Buttons
                  <div className="flex justify-start">
                    <div className="max-w-[95%] w-full">
                      <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm p-5 shadow-md">
                        {/* Agent header */}
                        <div className="text-[0.85vw] text-orange-600 mb-3 font-semibold tracking-wide">
                          {msg.agentInfo?.title || "Inventory Agent"} •{" "}
                          {msg.agentInfo?.id || "inventory_agent"}
                        </div>

                        {/* Inventory Message */}
                        <div className="mb-3">
                          <p className="text-[0.95vw] text-gray-900 mb-4 font-semibold leading-relaxed tracking-tight">
                            Inventory checked! Choose Buy Online or nearest
                            store.
                          </p>

                          {/* Purchase Method Selection */}
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-2xl">📦</span>
                              <h3 className="font-extrabold text-[1.1vw] text-gray-800 tracking-tight">
                                Choose Purchase Method
                              </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleQuickReply("Ship to Home")}
                                className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-md p-2.5 flex flex-col items-center gap-1.5 transition-all shadow-md hover:shadow-lg hover:scale-105"
                              >
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                  <span className="text-sm">🛒</span>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-[0.75vw] mb-0">
                                    Buy Online
                                  </div>
                                  <div className="text-[0.65vw] text-green-100">
                                    Home Delivery
                                  </div>
                                </div>
                              </button>

                              <button
                                onClick={() =>
                                  handleQuickReply("Nearest Store")
                                }
                                className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-md p-2.5 flex flex-col items-center gap-1.5 transition-all shadow-md hover:shadow-lg hover:scale-105"
                              >
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                  <span className="text-sm">🏪</span>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-[0.75vw] mb-0">
                                    Nearest Store
                                  </div>
                                  <div className="text-[0.65vw] text-orange-100">
                                    Store Pickup
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : msg.type === "store-selection" ? (
                  // Store Selection Message
                  <div className="flex justify-start">
                    <div className="max-w-[95%] w-full">
                      <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm p-5 shadow-md">
                        {/* Agent header */}
                        <div className="text-[0.85vw] text-orange-600 mb-3 font-semibold tracking-wide">
                          {msg.agentInfo?.title || "Inventory Agent"} •{" "}
                          {msg.agentInfo?.id || "inventory_agent"}
                        </div>

                        <div className="mb-4">
                          <p className="text-[0.95vw] text-gray-900 mb-4 font-semibold leading-relaxed tracking-tight">
                            Inventory checked! Choose Buy Online or nearest
                            store.
                          </p>

                          {/* Store Selection Section */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-[0.9vw]">🏪</span>
                              <h4 className="text-[0.95vw] font-semibold text-gray-900 tracking-tight">
                                Select Store for Pickup
                              </h4>
                            </div>

                            <div className="space-y-3">
                              {/* ABFRL Store South City */}
                              <div
                                onClick={() =>
                                  handleQuickReply("ABFRL Store South City")
                                }
                                className="flex items-center justify-between p-3 border-2 border-orange-200 rounded-lg hover:border-orange-300 cursor-pointer transition-all hover:shadow-md bg-white"
                              >
                                <div>
                                  <h5 className="text-[0.9vw] font-medium text-gray-900 tracking-tight">
                                    ABFRL Store South City
                                  </h5>
                                  <p className="text-[0.7vw] text-gray-600">
                                    Manager Sophia
                                  </p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-[0.7vw] font-semibold rounded-full">
                                  Available
                                </span>
                              </div>

                              {/* City Centre Salt Lake */}
                              <div
                                onClick={() =>
                                  handleQuickReply("City Centre Salt Lake")
                                }
                                className="flex items-center justify-between p-3 border-2 border-orange-200 rounded-lg hover:border-orange-300 cursor-pointer transition-all hover:shadow-md bg-white"
                              >
                                <div>
                                  <h5 className="text-[0.9vw] font-medium text-gray-900 tracking-tight">
                                    City Centre Salt Lake, First Floor
                                  </h5>
                                  <p className="text-[0.7vw] text-gray-600">
                                    Manager Rahul
                                  </p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-[0.7vw] font-semibold rounded-full">
                                  Available
                                </span>
                              </div>

                              {/* Quest Mall */}
                              <div
                                onClick={() => handleQuickReply("Quest Mall")}
                                className="flex items-center justify-between p-3 border-2 border-orange-200 rounded-lg hover:border-orange-300 cursor-pointer transition-all hover:shadow-md bg-white"
                              >
                                <div>
                                  <h5 className="text-[0.9vw] font-medium text-gray-900 tracking-tight">
                                    Quest Mall, Second Floor
                                  </h5>
                                  <p className="text-[0.7vw] text-gray-600">
                                    Manager Priya
                                  </p>
                                </div>
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[0.7vw] font-semibold rounded-full">
                                  Limited
                                </span>
                              </div>

                              {/* South City Mall */}
                              <div
                                onClick={() =>
                                  handleQuickReply("South City Mall")
                                }
                                className="flex items-center justify-between p-3 border-2 border-orange-200 rounded-lg hover:border-orange-300 cursor-pointer transition-all hover:shadow-md bg-white"
                              >
                                <div>
                                  <h5 className="text-[0.9vw] font-medium text-gray-900 tracking-tight">
                                    South City Mall, Third Floor
                                  </h5>
                                  <p className="text-[0.7vw] text-gray-600">
                                    Manager Neha
                                  </p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-[0.7vw] font-semibold rounded-full">
                                  Available
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : msg.type === "store-handoff" ? (
                  // Store Handoff Message with Enhanced UI
                  <div className="flex justify-start">
                    <div className="max-w-[95%] w-full">
                      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-300 rounded-xl rounded-tl-sm p-2.5 shadow-lg">
                        {/* Agent header */}
                        <div className="text-[0.65vw] text-gray-600 mb-1.5 font-semibold flex items-center gap-1.5">
                          <span className="w-6 h-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-xs">
                            🏪
                          </span>
                          <span>
                            {msg.agentInfo?.title || "Fulfillment Agent"} •{" "}
                            {msg.agentInfo?.id || "fulfillment_agent"}
                          </span>
                        </div>

                        {/* Main Title */}
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg p-2 mb-2 shadow-sm">
                          <h3 className="text-[0.9vw] font-bold flex items-center gap-1.5">
                            <span className="text-lg">🔄</span>
                            Channel Switching: Online → In-Store Kiosk
                          </h3>
                        </div>

                        {/* Session Info Card */}
                        <div className="bg-white rounded-lg p-2 mb-2 border border-orange-200 shadow-sm">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-sm">📋</span>
                            <h4 className="text-[0.8vw] font-bold text-orange-600">
                              Session Transfer
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[0.7vw]">
                            <div className="bg-purple-50 rounded p-1.5">
                              <span className="text-purple-600 font-semibold">
                                🆔 Session:
                              </span>
                              <div className="font-mono font-bold text-purple-800 text-[0.65vw]">
                                {msg.storeData?.sessionId}
                              </div>
                            </div>
                            <div className="bg-blue-50 rounded p-1.5">
                              <span className="text-blue-600 font-semibold">
                                👤 Customer:
                              </span>
                              <div className="font-bold text-blue-800">
                                {msg.storeData?.customerName}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Details Card */}
                        <div className="bg-white rounded-lg p-2 mb-2 border border-orange-200 shadow-sm">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-sm">📦</span>
                            <h4 className="text-[0.8vw] font-bold text-orange-600">
                              Product
                            </h4>
                          </div>
                          <div className="text-[0.75vw] space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-700">
                                👕
                              </span>
                              <span className="font-bold text-gray-900">
                                {msg.storeData?.product}
                              </span>
                            </div>
                            <div className="flex gap-3 text-[0.7vw]">
                              <span>
                                <span className="text-gray-600">Size:</span>{" "}
                                <span className="font-semibold">
                                  {msg.storeData?.size}
                                </span>
                              </span>
                              <span>
                                <span className="text-gray-600">Color:</span>{" "}
                                <span className="font-semibold">
                                  {msg.storeData?.color}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[0.6vw] bg-gray-100 px-1.5 py-0.5 rounded">
                                {msg.storeData?.sku}
                              </span>
                              <span className="font-bold text-orange-600 text-[0.85vw]">
                                {msg.storeData?.price}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Store Handoff Card */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 border border-green-300 shadow-sm">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-sm">🏪</span>
                            <h4 className="text-[0.8vw] font-bold text-green-700">
                              Store Handoff
                            </h4>
                          </div>
                          <div className="text-[0.75vw] space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-700">
                                📍
                              </span>
                              <span className="font-bold text-gray-900">
                                {msg.storeData?.storeName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-700">
                                👨‍💼
                              </span>
                              <span className="font-bold text-gray-900">
                                {msg.storeData?.manager}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-[0.7vw] ${
                                  msg.storeData?.status === "Available"
                                    ? "bg-green-200 text-green-800"
                                    : "bg-orange-200 text-orange-800"
                                }`}
                              >
                                {msg.storeData?.status === "Available"
                                  ? "✅ "
                                  : "⚠️ "}
                                {msg.storeData?.status}
                              </span>
                            </div>
                            {msg.storeData?.warning && (
                              <div className="bg-yellow-100 border-l-2 border-yellow-500 p-1.5 rounded mt-1">
                                <span className="text-yellow-800 text-[0.7vw] font-semibold">
                                  ⚡ {msg.storeData.warning}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ready Badge */}
                        <div className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-1.5 text-center shadow-sm">
                          <span className="text-[0.75vw] font-bold flex items-center justify-center gap-1.5">
                            <span className="text-sm">✨</span>
                            Ready for In-Store Assistance!
                            <span className="text-sm">✨</span>
                          </span>
                        </div>
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : msg.type === "tracking" ? (
                  // Tracking Message with Custom UI
                  <div className="flex justify-start">
                    <div className="max-w-[95%] w-full">
                      <div className="bg-white border border-blue-200 rounded-2xl rounded-tl-sm p-3 shadow-md">
                        {/* Agent header */}
                        <div className="text-[0.7vw] text-gray-500 mb-2 font-medium">
                          {msg.agentInfo?.title || "Tracking Agent"} •{" "}
                          {msg.agentInfo?.id || "tracking_agent"}
                        </div>

                        {/* Tracking Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">📦</span>
                            </div>
                            <div>
                              <h3 className="text-[0.8vw] font-bold text-blue-800">
                                ORDER TRACKING
                              </h3>
                              <p className="text-[0.65vw] text-blue-600">
                                🆔 Order ID: #ORD789456
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Timeline */}
                        <div className="mb-2">
                          <h4 className="text-[0.75vw] font-semibold text-gray-800 mb-2 flex items-center gap-1">
                            🚀 <span>DELIVERY TIMELINE</span>
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                              <div className="flex-1">
                                <span className="text-[0.7vw] font-medium text-green-800">
                                  ✅ Payment Confirmed
                                </span>
                                <p className="text-[0.6vw] text-green-600">
                                  Dec 12, 2025 at 8:28 PM
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                              <div className="flex-1">
                                <span className="text-[0.7vw] font-medium text-green-800">
                                  ✅ Order Packed
                                </span>
                                <p className="text-[0.6vw] text-green-600">
                                  Dec 13, 2025 at 9:15 AM
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                                <span className="text-white text-xs">🚚</span>
                              </div>
                              <div className="flex-1">
                                <span className="text-[0.7vw] font-medium text-yellow-800">
                                  🚚 Out for Delivery
                                </span>
                                <p className="text-[0.6vw] text-yellow-600">
                                  Dec 14, 2025 at 7:45 AM
                                </p>
                              </div>
                              <div className="text-[0.65vw] font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded">
                                IN PROGRESS
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Current Status */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-2 mb-2">
                          <h4 className="text-[0.75vw] font-semibold text-indigo-800 mb-1">
                            📍 CURRENT STATUS
                          </h4>
                          <p className="text-[0.7vw] text-indigo-700 mb-1">
                            Your package is on its way to you!
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-[0.65vw] font-medium text-indigo-600">
                              ⏰ Expected Delivery:
                            </span>
                            <span className="text-[0.65vw] font-bold text-indigo-800 bg-indigo-100 px-1.5 py-0.5 rounded">
                              Today by 6:00 PM
                            </span>
                          </div>
                        </div>

                        {/* Shipping Details */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                          <h4 className="text-[0.75vw] font-semibold text-gray-800 mb-1">
                            🚛 SHIPPING DETAILS
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[0.6vw] text-gray-600">
                                Carrier:
                              </span>
                              <p className="text-[0.65vw] font-medium text-gray-800">
                                BlueDart Express
                              </p>
                            </div>
                            <div>
                              <span className="text-[0.6vw] text-gray-600">
                                Tracking ID:
                              </span>
                              <p className="text-[0.65vw] font-medium text-gray-800 font-mono">
                                📋 BD789456123
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : msg.type === "products" ? (
                  // Product Cards with Conversational Message
                  <div className="flex justify-start">
                    <div className="max-w-[95%] w-full">
                      <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm p-5 shadow-md">
                        {/* Agent header */}
                        <div className="text-[0.85vw] text-orange-600 mb-3 font-semibold tracking-wide">
                          {msg.agentInfo?.title || "Recommendation Agent"} •{" "}
                          {msg.agentInfo?.id || "recommendation_agent"}
                        </div>

                        {/* Conversational message */}
                        <div className="text-[0.95vw] text-gray-900 mb-4 font-semibold leading-relaxed tracking-tight">
                          {msg.round === 1
                            ? "I recommend these shirts based on your past buys (Raymond last month). Raymond Shirt is ₹1,789 and trending — want me to check size 40 availability?"
                            : "Here are more great options for you! These are also popular choices in your preferred price range."}
                        </div>

                        {/* Product cards */}
                        <div className="grid grid-cols-3 gap-4">
                          {(msg.round === 1
                            ? [
                                {
                                  name: "Louis Philippe",
                                  price: "₹2,199",
                                  img: "/images/Louis Philippe Shirt.avif",
                                },
                                {
                                  name: "Raymond",
                                  price: "₹1,789",
                                  img: "/images/shirt 2.avif",
                                  trending: true,
                                },
                                {
                                  name: "Peter England",
                                  price: "₹2,850",
                                  img: "/images/shirt 4.avif",
                                },
                              ]
                            : [
                                {
                                  name: "Van Heusen Shirt",
                                  price: "₹2,299",
                                  img: "/images/shirt 4.avif",
                                },
                                {
                                  name: "Arrow Shirt",
                                  price: "₹2,450",
                                  img: "/images/shirt 2.avif",
                                },
                                {
                                  name: "Allen Solly Shirt",
                                  price: "₹1,999",
                                  img: "/images/Louis Philippe Shirt.avif",
                                  trending: true,
                                },
                              ]
                          ).map((product, pIdx) => (
                            <div
                              key={pIdx}
                              className="bg-gradient-to-b from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100 shadow-sm hover:shadow-md transition-all"
                            >
                              <img
                                src={product.img}
                                alt={product.name}
                                className="w-full h-36 object-cover rounded-lg mb-2"
                              />
                              <div className="text-[0.95vw] font-semibold text-gray-900 tracking-tight mb-1 tracking-tight">
                                {product.name}
                                {product.trending && (
                                  <span className="ml-1.5 text-[0.7vw] bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                    🔥 Trending
                                  </span>
                                )}
                              </div>
                              <div className="text-[1vw] font-extrabold text-orange-600 mb-3 tracking-tight">
                                {product.price}
                              </div>

                              {/* CTA Button */}
                              <button
                                onClick={() =>
                                  handleQuickReply("Check Availability")
                                }
                                className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-[0.8vw] font-medium transition-all shadow-sm hover:shadow-md"
                              >
                                Check Availability
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Agent Message (Left)
                  <div className="flex justify-start">
                    <div className="max-w-[70%]">
                      <div className="bg-white border border-orange-200 rounded-2xl rounded-tl-sm px-5 py-3 shadow-md">
                        <p className="text-[1vw] text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      </div>
                      <p className="text-[0.8vw] text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
                    <div
                      className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
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
                  onClick={() => {
                    /* Voice input handler */
                  }}
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

            {/* Channel Switcher removed as requested */}
          </div>
        </div>
      </div>

      {/* Payment Failure Popup */}
      {showPaymentFailure && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-6">
                Your credit card payment could not be processed. Please try with
                a different payment method.
              </p>
              <button
                onClick={() => {
                  setShowPaymentFailure(false);
                  setPaymentAttempt(2);
                  setSelectedPaymentMethod(null);
                  // Trigger new payment agent message with proper agent logs
                  setTimeout(() => {
                    addAgentLog(
                      "System",
                      "PaymentAgent-2",
                      "Activating backup payment processor"
                    );
                    addAgentLog(
                      "PaymentAgent-2",
                      "PaymentGateway",
                      "Initialize alternative payment methods"
                    );
                    addAgentLog(
                      "PaymentGateway",
                      "PaymentAgent-2",
                      "Alternative payment options ready"
                    );
                    addAgentLog(
                      "PaymentAgent-2",
                      "User",
                      "Presenting retry payment options"
                    );
                    addAgentMessage(
                      "Let's try again with a different payment method:\n\nTotal amount: ₹1,789\nDelivery: ₹0 (Free)\n━━━━━━━━━━━━\nGrand Total: ₹1,789",
                      ["UPI", "Debit Card", "Cash on Delivery"],
                      { title: "Payment Agent (Retry)", id: "payment_agent_2" },
                      "payment"
                    );
                  }, 500);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
