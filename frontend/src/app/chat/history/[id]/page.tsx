"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const ChatHistoryDetail = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    const chatSession = chatHistory.find((chat: any) => chat.id === Number(id));
    setMessages(chatSession ? chatSession.messages : []);
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Chat History Details</h1>
      {messages.length === 0 ? (
        <p className="text-gray-500">No messages found.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-xs ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-200"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistoryDetail;
