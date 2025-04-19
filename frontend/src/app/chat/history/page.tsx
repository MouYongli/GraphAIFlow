"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const ChatHistory = () => {
  const [history, setHistory] = useState<{ id: number; messages: any[] }[]>([]);

  useEffect(() => {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    setHistory(chatHistory);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Chat History</h1>
      {history.length === 0 ? (
        <p className="text-gray-500">No chat history available.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((chat) => (
            <li key={chat.id} className="p-4 border rounded-lg">
              <Link href={`/chat/history/${chat.id}`}>
                <span className="text-blue-500 cursor-pointer">
                  Chat from {new Date(chat.id).toLocaleString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatHistory;
