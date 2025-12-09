import React, { useState, useEffect } from "react";
import data from "../data/admin.json";

export default function UserJourney() {
  const [newPurchase, setNewPurchase] = useState(null);
  const [tempPurchases, setTempPurchases] = useState([]);
  const [loyaltyPointsUpdate, setLoyaltyPointsUpdate] = useState(0);

  const user = data.users.find((u) => u.id === "00001");

  if (!user) {
    return <div className="bg-[#0d0d0d] text-gray-200 p-6">User not found</div>;
  }

  // Check for new purchases from chatbot interaction and clear on page refresh
  useEffect(() => {
    // Clear temp purchases when page is about to unload (refresh/close)
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("newOnlinePurchase");
      setLoyaltyPointsUpdate(0); // Reset loyalty points update on refresh
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const checkForNewPurchase = () => {
      const purchaseData = sessionStorage.getItem("newOnlinePurchase");
      if (purchaseData) {
        const purchase = JSON.parse(purchaseData);
        setNewPurchase(purchase);

        // Add to temporary purchases if not already added
        const productId = purchase.product?.id;
        if (productId && !tempPurchases.find((temp) => temp.id === productId)) {
          setTempPurchases((prev) => [
            { id: productId, timestamp: Date.now() },
            ...prev,
          ]);

          // Use hardcoded loyalty points from chat (120 points as shown in loyalty agent)
          const pointsEarned = 120;
          setLoyaltyPointsUpdate((prev) => prev + pointsEarned);
        }

        // Clear notification after displaying
        setTimeout(() => {
          setNewPurchase(null);
        }, 10000); // Hide notification after 10 seconds
      }
    };

    checkForNewPurchase();
    // Check every 2 seconds for new purchases
    const interval = setInterval(checkForNewPurchase, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [tempPurchases]);

  // Combine regular purchases with temporary purchases
  const allPurchases = [
    ...tempPurchases.map((temp) => temp.id),
    ...user.purchases,
  ];

  const productMap = {};
  allPurchases.forEach((pid) => {
    if (productMap[pid] == undefined) {
      productMap[pid] = 1;
    } else {
      productMap[pid] = productMap[pid] + 1;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-800 to-amber-600 flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent">
              Customer Profile
            </h1>
            <p className="text-gray-600 mt-1">
              View purchase history and loyalty details
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="mb-8 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border border-yellow-200 rounded-3xl p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center md:text-left">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                Username
              </p>
              <p className="text-3xl font-bold text-gray-900">{user.name}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                Loyalty Points
              </p>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border-2 border-emerald-500 rounded-2xl px-6 py-3">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-3xl font-bold text-amber-600">
                  {850 + loyaltyPointsUpdate}
                  {loyaltyPointsUpdate > 0 && (
                    <span className="text-green-600 text-lg ml-2 animate-bounce">
                      (+{loyaltyPointsUpdate})
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                User ID
              </p>
              <p className="text-xl font-mono font-semibold text-red-800 bg-amber-50 border border-amber-300 rounded-2xl px-4 py-3 inline-block">
                {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* New Purchase Notification */}
        {newPurchase && (
          <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  New Purchase Completed!
                </h3>
                <p className="text-green-100">
                  🎉 You just bought{" "}
                  <span className="font-bold">{newPurchase.product?.name}</span>{" "}
                  online via the chatbot!
                </p>
                <p className="text-sm text-green-200 mt-2">
                  Order will be processed and delivered soon. You earned{" "}
                  <span className="font-bold text-yellow-300">
                    +120 loyalty points!
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order History Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-800 to-amber-600 flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-800 to-amber-600 bg-clip-text text-transparent">
              Order History
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(productMap).map((pid) => {
            const prod = data.products.find((p) => p.id === pid);
            if (!prod) return null;

            // Check if this is a new temporary purchase
            const isNewPurchase = tempPurchases.some((temp) => temp.id === pid);

            return (
              <div
                key={pid}
                className={`group ${
                  isNewPurchase
                    ? "bg-green-50 border-green-300 ring-2 ring-green-200"
                    : "bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-yellow-200"
                } rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2`}
              >
                <div className="relative overflow-hidden bg-white">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-72 object-contain group-hover:scale-105 transition-transform duration-700 p-6"
                    onError={(e) => {
                      e.target.src = "/images/mobile.png";
                    }}
                  />
                  <div
                    className={`absolute top-5 right-5 ${
                      isNewPurchase
                        ? "bg-green-600"
                        : "bg-gradient-to-br from-red-800 to-amber-600"
                    } text-white rounded-2xl px-5 py-2.5 shadow-xl`}
                  >
                    <div className="flex items-center gap-2">
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
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <span className="text-sm font-bold">
                        x{productMap[pid]}
                      </span>
                    </div>
                  </div>
                  {isNewPurchase && (
                    <div className="absolute top-5 left-5 bg-green-500 text-white rounded-2xl px-3 py-1.5 shadow-xl text-xs font-bold">
                      NEW!
                    </div>
                  )}
                </div>
                <div className="p-7 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 line-clamp-2 min-h-[3.5rem]">
                    {prod.name}
                  </h3>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Price</span>
                      <span className="text-3xl font-bold text-red-800">
                        ₹{prod.price}
                      </span>
                    </div>
                    <button className="bg-gradient-to-r from-red-800 to-amber-600 hover:from-red-900 hover:to-amber-700 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center gap-2">
                      <span>View</span>
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
