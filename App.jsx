import React from "react";
import ChatbotInteraction from "./components/ChatbotInteraction.jsx";

export default function App({ onClose }) {
  return <ChatbotInteraction onClose={onClose} />;
}
