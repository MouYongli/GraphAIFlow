"use client";

import React, { useEffect, useState } from "react";
import MessageList from "@/components/chat/MessageList";
import Input from "@/components/chat/Input";
import Button from "@/components/chat/Button";

const MyChat = () => {
  const [messages, setMessages] = useState<
    { id: number; text: string; sender: "user" | "bot" }[]
  >([]);
  const [inputValue, setInputValue] = useState("");

  // ✅ 每次 messages 变化时，存入 localStorage
  useEffect(() => {
    localStorage.setItem("currentChat", JSON.stringify(messages));
  }, [messages]);

  // ✅ 清空聊天
  const clearChat = async () => {
    setMessages([]); // 清空前端
    localStorage.removeItem("currentChat"); // 清空本地缓存

    try {
      await fetch("http://localhost:8000/api/chat/clear", {
        method: "POST",
      });
    } catch (error) {
      console.error("❌ 清空对话失败：", error);
    }
  };

  const sendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user" as const,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputValue,
          chat_history: updatedMessages
            .slice(0, updatedMessages.length - 1)
            .map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
        }),
      });

      const data = await res.json();
      const botMessage = {
        id: userMessage.id + 1,
        text: data.reply || "🤖 出现错误，未返回有效回复。",
        sender: "bot" as const,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: userMessage.id + 1,
          text: "⚠️ 请求失败，请检查网络或后端服务。",
          sender: "bot" as const,
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 p-6 w-full h-[90vh] max-w-[1000px] mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Chat with AI</h1>
        <button
          onClick={clearChat}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑 清空对话
        </button>
      </div>

      <MessageList messages={messages} />

      <div className="mt-auto flex space-x-2 p-3 bg-white shadow-md rounded-lg">
        <Input value={inputValue} onChange={setInputValue} />
        <Button onClick={sendMessage} text="Send" />
      </div>
    </div>
  );
};

export default MyChat;
