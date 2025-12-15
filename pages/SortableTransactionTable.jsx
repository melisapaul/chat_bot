import React, { useState, useMemo, useEffect } from "react";
// Note: Assuming the file path is correct relative to this component.
import data from "../data/admin.json";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const getStatusClasses = (status) => {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-800";
    case "In Progress":
      return "bg-yellow-100 text-yellow-800";
    case "Complete":
    case "Completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Accept 'storeId' as a prop to filter the data
export default function StoreDetailsTable({ storeId }) {
  console.log(
    "storeId",
    storeId.length == 0 || storeId == undefined || storeId == ""
  );
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "descending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingOfflineOrders, setPendingOfflineOrders] = useState([]);
  const itemsPerPage = 10;

  // Listen for new offline orders and clear on page unload
  useEffect(() => {
    // Clear orders when page is about to unload (refresh/close)
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("newOfflineOrder");
      sessionStorage.removeItem("showDemoTransaction");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const checkForPendingOrders = () => {
      const orderData = sessionStorage.getItem("newOfflineOrder");
      if (orderData) {
        const order = JSON.parse(orderData);
        const orderId = `PENDING_${order.timestamp || Date.now()}`;

        // Check if this order already exists in our pending orders
        const existingOrder = pendingOfflineOrders.find(
          (pending) => pending.id === orderId
        );

        if (!existingOrder) {
          // Create a transaction-like object for the pending order
          const pendingTransaction = {
            id: "00001",
            // date: order.date || new Date().toISOString().split("T")[0],
            userId: "00001",
            productId: order.product?.id,
            qty: order.qty || 1,
            mode: order.mode || "Offline",
            storeId: order.store?.id,
            orderStatus: order.orderStatus || "In Progress",
            amount: Number(order.product?.price || 0),
            userName: order.userName,
            productName: order.product?.name,
            userAddress: order.userAddress || "29 Main Street, City 9",
            userPhone: order.userPhone || "555-1029",
            storeName:
              order.store?.store_name ||
              order.store?.location ||
              "ABFRL South City Store",
            isPending: true, // Flag to identify pending orders
          };

          // Add to existing pending orders instead of replacing
          setPendingOfflineOrders((prev) => [pendingTransaction, ...prev]);
        }
      }
    };

    checkForPendingOrders();
    // Check every 2 seconds for new orders
    const interval = setInterval(checkForPendingOrders, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pendingOfflineOrders]);

  // 1. Filter transactions based on the storeId prop
  const filteredTransactions = useMemo(() => {
    // Ensure data.transactions is an array before filtering
    if (!data.transactions || !Array.isArray(data.transactions)) return [];
    if (storeId.length == 0 || storeId == undefined || storeId == "") {
      return data.transactions;
    } else {
      return data.transactions.filter(
        (transaction) => transaction.storeId === storeId
      );
    }
  }, [storeId]); // Dependency on storeId

  // 2. Enrich the *filtered* data and combine with pending orders
  const enrichedTransactions = useMemo(() => {
    const regularTransactions = filteredTransactions.map((transaction) => {
      const user = data.users.find((u) => u.id === transaction.userId);
      const product = data.products.find((p) => p.id === transaction.productId);
      const store = data.storeKeepers.find((s) => s.id === transaction.storeId);
      return {
        ...transaction,
        userName: user ? user.name : "Unknown User",
        productName: product ? product.name : "Unknown Product",
        userAddress: user ? user.address : "N/A",
        userPhone: user ? user.phone : "N/A",
        storeName:
          transaction.mode === "Online"
            ? "NA"
            : store
            ? store.store_name
            : "Unknown Store",
        isPending: false,
      };
    });

    // Show hardcoded demo transaction only when the chatbot sets the flag
    const showDemo = sessionStorage.getItem("showDemoTransaction") === "true";
    const demoTransaction = {
      id: "00001",
      date: "2025-12-14T14:22:46.238Z",
      userId: "#0001",
      userName: "Arjun Bose",
      productName: "Louis Philippe",
      qty: 1,
      mode: "Offline",
      storeName: "ABFRL South City Store",
      orderStatus: "Completed",
      amount: Number(2199),
      userAddress: "29 Main Street, City 9",
      userPhone: "555-1029",
      isPending: false,
    };

    // Combine demo (only when flagged), pending orders, then regular transactions
    const combined = [
      ...(showDemo ? [demoTransaction] : []),
      ...pendingOfflineOrders,
      ...regularTransactions,
    ];
    // Deduplicate by id (preserve first occurrence)
    const seen = new Set();
    const deduped = [];
    for (const item of combined) {
      if (!item || !item.id) continue;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      deduped.push(item);
    }
    return deduped;
  }, [filteredTransactions, pendingOfflineOrders]); // Updated dependencies

  // 3. Sort the *enriched* data
  const sortedTransactions = useMemo(() => {
    let sortableItems = [...enrichedTransactions];
    sortableItems.sort((a, b) => {
      // Special sorting logic for dates
      if (sortConfig.key === "date") {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA < dateB) return sortConfig.direction === "ascending" ? -1 : 1;
        if (dateA > dateB) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      }
      // General sorting for strings/numbers
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [enrichedTransactions, sortConfig]); // Dependency on enrichedTransactions

  // Pagination logic
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUpIcon className="w-4 h-4 ml-1 inline" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 ml-1 inline" />
    );
  };

  const HeaderCell = ({ title, sortKey }) => (
    <th
      onClick={() => requestSort(sortKey)}
      className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-amber-50 transition-colors"
    >
      <div className="flex items-center gap-2">
        {title}
        <SortIcon columnKey={sortKey} />
      </div>
    </th>
  );

  const storeName = useMemo(() => {
    var store = {};
    if (storeId.length == 0 || storeId == undefined || storeId == "") {
      store = {};
    } else {
      store = data.storeKeepers.find((s) => s.id === storeId);
    }

    console.log("store", store.name != undefined ? store.name : "All Store");

    return store.name ? store.name : "All Store";
  }, [storeId]);

  return (
    <div>
      <div className="bg-gradient-to-r from-red-800 to-amber-600 rounded-t-3xl p-6 mb-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Transaction History of ABFRL Stores across the Zone
          </h2>
        </div>
      </div>
      <div className="bg-white rounded-b-3xl shadow-xl border border-t-0 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-red-50 via-amber-50 to-yellow-50">
              <tr className="border-b-2 border-amber-300">
                <HeaderCell title="ID" sortKey="id" />
                <HeaderCell title="Date" sortKey="date" />
                <HeaderCell title="User Name" sortKey="userName" />
                <HeaderCell title="Product" sortKey="productName" />
                <HeaderCell title="Qty" sortKey="qty" />
                <HeaderCell title="Mode" sortKey="mode" />
                <HeaderCell title="Store Name" sortKey="storeName" />
                <HeaderCell title="Status" sortKey="orderStatus" />
                <HeaderCell title="Amount" sortKey="amount" />
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentTransactions.map((transaction, idx) => (
                <tr
                  key={transaction.id}
                  className={`hover:bg-amber-50 transition-colors ${
                    transaction.isPending
                      ? "bg-yellow-50 border-l-4 border-yellow-400 animate-pulse"
                      : idx % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-bold ${
                        transaction.isPending
                          ? "text-orange-600 flex items-center gap-1"
                          : "text-red-800"
                      }`}
                    >
                      {transaction.isPending && (
                        <svg
                          className="w-4 h-4 text-orange-500 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      )}
                      {transaction.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {transaction.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transaction.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                      {transaction.qty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        transaction.mode === "Online"
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {transaction.mode}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    {transaction.storeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusClasses(
                        transaction.orderStatus
                      )}`}
                    >
                      {transaction.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{Number(transaction.amount || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {transaction.userAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transaction.userPhone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gradient-to-r from-gray-50 to-amber-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(endIndex, sortedTransactions.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {sortedTransactions.length}
                </span>{" "}
                transactions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-red-800 hover:bg-amber-50 border border-amber-200 shadow-sm"
                  }`}
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentPage === page
                              ? "bg-gradient-to-r from-red-800 to-amber-600 text-white shadow-lg"
                              : "bg-white text-gray-700 hover:bg-amber-50 border border-gray-200"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 py-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-red-800 hover:bg-amber-50 border border-amber-200 shadow-sm"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
