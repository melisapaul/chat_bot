import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InStoreChatbot from "../components/InStoreChatbot";

export default function InStoreSession() {
  const navigate = useNavigate();
  const [showChatbot, setShowChatbot] = useState(true);

  const handleCloseChatbot = () => {
    setShowChatbot(false);
    navigate("/"); // Redirect to home when chatbot is closed
  };

  if (!showChatbot) {
    return null; // This will trigger navigation to home
  }

  return (
    <div className="h-screen">
      <InStoreChatbot onClose={handleCloseChatbot} />
    </div>
  );
}
