"use client";

import React, { useEffect, useState } from "react";
import MessageList from "@/components/chat/MessageList";
import Input from "@/components/chat/Input";
import Button from "@/components/chat/Button";

const MyChat = () => {
  const [messages, setMessages] = useState<{ id: number; text: string; sender: "user" | "bot" }[]>([]);
  const [inputValue, setInputValue] = useState("");

  // ✅ 每次 messages 变化时，存入 localStorage
  useEffect(() => {
    localStorage.setItem("currentChat", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = () => {
    if (inputValue.trim() !== "") {
      setMessages([...messages, { id: messages.length + 1, text: inputValue, sender: "user" }]);
      setInputValue("");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: "Hello! How can I help?", sender: "bot" },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 p-6 max-w-5xl mx-auto w-full min-h-[70vh]">
      <h1 className="text-xl font-bold mb-4">Chat with AI</h1>
      <MessageList messages={messages} />
      <div className="mt-auto flex space-x-2 p-3 bg-white shadow-md rounded-lg">
        <Input value={inputValue} onChange={setInputValue} />
        <Button onClick={sendMessage} text="Send" />
      </div>
    </div>
  );
};

export default MyChat;
