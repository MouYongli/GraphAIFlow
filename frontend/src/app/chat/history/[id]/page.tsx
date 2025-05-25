"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

const ChatHistoryDetail = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    const chatSession = chatHistory.find((chat: any) => chat.id === id); // ✅ 直接比较字符串
    setMessages(chatSession ? chatSession.messages : []);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
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
          chat_history: updatedMessages.slice(0, -1).map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
        }),
      });

      const data = await res.json();
      const botMessage = {
        id: userMessage.id + 1,
        text: data.reply || "🤖 出现错误，未返回有效回复。",
        sender: "bot",
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
      const updatedChatHistory = chatHistory.map((chat: any) => {
        if (chat.id === id) { // ✅ 修正为字符串比较
          return { ...chat, messages: finalMessages };
        }
        return chat;
      });
      localStorage.setItem("chatHistory", JSON.stringify(updatedChatHistory));
    } catch (error) {
      const errorMessage = {
        id: userMessage.id + 1,
        text: "⚠️ 请求失败，请检查网络或后端服务。",
        sender: "bot",
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);

      const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
      const updatedChatHistory = chatHistory.map((chat: any) => {
        if (chat.id === id) {
          return { ...chat, messages: finalMessages };
        }
        return chat;
      });
      localStorage.setItem("chatHistory", JSON.stringify(updatedChatHistory));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col h-[90vh]">
      <h1 className="text-xl font-bold mb-4">Chat History Detail</h1>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[75%] break-words ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-100 text-gray-900 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-4 flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="继续聊天..."
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatHistoryDetail;
