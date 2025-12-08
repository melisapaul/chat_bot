// Dark theme compact version
import React, { useState, useEffect, useRef } from "react";
import data from "./agents.json";
import "./page.css";

export default function App() {
  const agents = data.userJourney.agents;
  const [log, setLog] = useState([]);
  const [step, setStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [upi, setUpi] = useState("");
  const [feedback, setFeedback] = useState("");
  const [query, setQuery] = useState("");
  const chatEndRef = useRef(null);
  const searchRef = useRef("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const nextAgent = () => {
    if (step < agents.length) {
      searchRef.current.value = "";
      setQuery("");
      setLog((prev) => [...prev, agents[step]]);
      setStep((s) => s + 1);
    } else setStep(0);
  };

  const isJourneyComplete = step >= agents.length;

  return (
    <div className="h-screen top_section flex bg-[#0d0d0d] text-gray-200 font-sans text-[1.4vw] leading-[1.8vh]">
      {/* LEFT */}
      <div className="w-1/3 bottom_section p-4 overflow-y-auto border-r border-gray-700 bg-[#111]">
 
        <header className=" left_scroll min-h-[20%] max-h-[20%] p-4 border-b border-gray-700 bg-[#111] flex justify-between items-center">
          <div>
            <h1 className="text-[2vw] font-bold flex items-center">⚡ Agent Timeline</h1>
            <p className="text-[1vw] text-gray-400 mt-6">Live Orchestration Log</p>
          </div>
        
        </header>
        {log.length === 0 && (
          <div className="text-center p-4 bg-[#1a1a1a] rounded border border-gray-700 text-gray-500 text-[1vw]">
            Waiting to start journey...
          </div>
        )}

        <div className="space-y-3 relative pl-2 h-500 overflow-y-auto ds">
          {log.length > 0 && <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-blue-600" />}

          {log.map((a, i) => (
            <div key={i} className="relative pl-8">
              <div className="absolute left-0 top-1 h-3 w-3 bg-blue-500 rounded-full"></div>

              <div className="p-3 bg-[#1a1a1a] rounded border border-gray-700">
                <div className="flex justify-between mb-1">
                  <p className="font-bold text-[1.3vw]">{a.title}</p>
                  <span className="text-[0.8vw] bg-blue-900 px-2 py-1 rounded">{a.agentId}</span>
                </div>
                <p className="text-[1vw] text-gray-400">{a.action}</p>
              </div>
            </div>
          ))}

          {/* {isJourneyComplete && (
            <p className="text-green-500 font-bold text-[1.5vw] pl-8 mt-2">Journey Completed</p>
          )} */}
        </div>
      </div>

      {/* RIGHT */}
      <div className="bottom_section w-2/3 flex flex-col bg-[#0f0f0f]">
        <header className="min-h-[20%] max-h-[20%] p-4 border-b border-gray-700 bg-[#111] flex justify-between items-center">
          <div>
            <h1 className="text-[2vw] font-bold flex items-center">🤖 AI Orchestrator</h1>
            <p className="text-[1vw] text-gray-400 mt-6">Multi-agent automation simulation</p>
          </div>
          <div className="text-[1vw] bg-[#1a1a1a] px-3 py-1 rounded border border-gray-700">
            Status: {isJourneyComplete ? <span className="text-green-500">Complete</span> : <span className="text-blue-500">In Progress</span>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {log.length === 0 && (
            <div className="h-full flex flex-col justify-center items-center text-gray-600">
              <span className="text-[8vw]">👋</span>
              <p className="text-[1.5vw]">Click "Search" to begin!</p>
            </div>
          )}

          {log.map((agent, index) => (
            <div key={index} className="bg-[#1a1a1a] p-4 rounded border border-gray-700">
              <div className="flex items-center mb-3 border-b border-gray-700 pb-2">
                <div className="h-10 w-10 rounded flex justify-center items-center bg-blue-900 mr-3">💬</div>
                <h3 className="font-bold text-[1.4vw]">{agent.title}</h3>
              </div>

              {agent.output?.message && (
                <p className="text-gray-300 mb-4 text-[1.1vw] pl-12">{agent.output.message}</p>
              )}

              <div className="pl-12 space-y-4">
                {/* PRODUCT */}
                {agent.output?.products && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {agent.output.products.map((p) => (
                      <div
                        key={p.id}
                        className={`p-3 rounded cursor-pointer border ${selectedProduct?.id === p.id ? "bg-blue-900 border-blue-500" : "bg-[#111] border-gray-700"}`}
                        onClick={() => { setSelectedProduct(p); nextAgent(); }}
                      >
                        <div className="flex justify-between mb-2">
                          <p className="font-bold text-[1.1vw]">{p.name}</p>
                          <span className="bg-blue-800 px-2 py-1 rounded">₹{p.price.toLocaleString()}</span>
                        </div>
                        <p className="text-gray-400 text-[1vw]">{p.reason}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* INVENTORY */}
                  {agent.agentId === "inventory_agent" && agent.output?.availability && (
                  <div className="bg-[#111] p-4 rounded border border-gray-700">
                  <div className="text-green-500 font-bold mb-2 text-[1.1vw] flex items-center">
                  ✔ In Stock Online
                  </div>
                  <ul>
                  {agent.output.availability.stores.map((store, idx) => (
                  <li
                  key={idx}
                  className="flex justify-between items-center bg-[#0f0f0f] p-2 rounded border border-gray-700 mb-2"
                  >
                  <span className="text-[1vw]">{store.location}</span>
                  <span
                  className={`px-2 py-1 text-[0.9vw] rounded font-bold cursor-pointer ${store.stock === "Available" ? "bg-green-900 text-green-300" : "bg-orange-900 text-orange-300"}`}
                  onClick={() => nextAgent()}
                  >
                  {store.stock}
                  </span>
                  </li>
                  ))}
                  </ul>
                  </div>
                  )}

                  {/* DELIVERY */} {agent.agentId === "fulfillment_agent" && ( <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-xl shadow"> <h4 className="text-green-800 font-bold text-lg mb-2"> Delivery Scheduled </h4> <p className="text-green-700 font-medium"> Arrival: {agent.output.delivery.date} </p> </div> )}


                  {/* LOYALTY */}
                  {agent.agentId === "loyalty_agent" && (
                  <div className="bg-[#111] p-4 rounded border border-gray-700">
                  <h4 className="text-yellow-400 font-bold text-[1.2vw] mb-3">Savings Applied</h4>
                  <div className="flex gap-3">
                  <div className="bg-[#0f0f0f] p-2 rounded border border-gray-700 text-[1vw]">
                  🎟 Coupon: <span className="font-mono font-bold">{agent.output.coupon}</span>
                  </div>
                  <div className="bg-[#0f0f0f] p-2 rounded border border-gray-700 text-[1vw]">
                  ⭐ Points: <span className="font-bold">{agent.output.points}</span>
                  </div>
                  </div>
                  </div>
                  )}

                {/* PAYMENT */}
                {agent.agentId === "payment_agent" && (
                  <div className="bg-[#111] p-4 rounded border border-gray-700 max-w-sm">
                    <label className="block text-gray-300 mb-2 text-[1vw]">Enter UPI ID</label>
                    <div className="flex">
                      <input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="username@upi" className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded-l outline-none" />
                      <button className="bg-green-700 px-4 rounded-r">Pay</button>
                    </div>
                  </div>
                )}

                {/* FEEDBACK */}
                {agent.agentId === "post_purchase_agent" && (
                  <div className="bg-[#111] p-4 rounded border border-gray-700 max-w-lg">
                    <label className="block text-gray-300 mb-2 text-[1vw]">Your Feedback</label>
                    <textarea rows="3" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded outline-none"></textarea>
                    <button className="mt-3 w-full bg-blue-700 py-2 rounded">Submit</button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        <div className="p-4 min-h-[14%] border-t border-gray-700 bg-[#111] flex justify-between items-center">
          <span className="text-[1vw] text-gray-400">{isJourneyComplete ? "All steps executed." : `Step ${step} of ${agents.length}`}</span>

          {!isJourneyComplete && (
      
            <input  ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter Query..." className="p-2 bg-[#0f0f0f] border border-gray-700 rounded text-[1vw] min-w-[40%]" />
     
          )}

          <button onClick={nextAgent} className="px-4 py-2 bg-blue-700 rounded text-[1vw]">{isJourneyComplete ? "Restart" : "Search"}</button>
        </div>
      </div>
    </div>
  );
}