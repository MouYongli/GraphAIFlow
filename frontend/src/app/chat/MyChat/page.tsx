"use client";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MessageList from "@/components/chat/MessageList";
import Input from "@/components/chat/Input";
import Button from "@/components/chat/Button";

// 统一 chatId 格式生成函数
const generateChatId = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `frontend_chat_${yyyy}${MM}${dd}_${HH}${mm}${ss}`;
};

const MyChat = () => {
  const [selectedLang, setSelectedLang] = useState<"zh" | "en">("zh");
  const [selectedModel, setSelectedModel] = useState("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free");
  const [messages, setMessages] = useState<
    { id: number; text: string; sender: "user" | "bot"; type?: "normal" | "suggestion" }[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [generatedChatId, setGeneratedChatId] = useState("");
  const { t } = useTranslation();

  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("currentChat");
    const generatedId = generateChatId();
    setGeneratedChatId(generatedId);
    localStorage.setItem("currentChatId", generatedId);

    if (!saved || saved === "[]") {
      const welcome = {
        id: Date.now(),
        text: "👋 哈喽！想看、想吃、想玩什么？告诉我你的兴趣或时间安排，我来推荐北京值得去的地方！首先，请选择语言 / Hello! What do you want to see, eat or do? Tell me your interests or schedule and I'll recommend places to visit in Beijing! Please select a language:",
        sender: "bot" as const,
      };
      setMessages([welcome]);
      localStorage.setItem("currentChat", JSON.stringify([welcome]));
    } else {
      setMessages(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("currentChat", JSON.stringify(messages));
  }, [messages]);

  const clearChat = async () => {
    const welcome = {
      id: Date.now(),
      text: "👋 欢迎回来！请告诉我你接下来的旅游需求吧～/👋 Welcome back! Please let me know what you need to travel next~",
      sender: "bot" as const,
    };
    setMessages([welcome]);
    localStorage.setItem("currentChat", JSON.stringify([welcome]));

    try {
      await fetch("http://localhost:8000/api/chat/clear", { method: "POST" });
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
      const res = await fetch("http://localhost:8000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: inputValue,
          prompt: "",
          lang: selectedLang,
          model_name: selectedModel,
        }),
      });

      const data = await res.json();

      const botMessage = {
        id: userMessage.id + 1,
        text: data.finalText || "🤖 未生成推荐结果。",
        sender: "bot" as const,
        type: (data.isRecommendation ? "suggestion" : "normal") as "normal" | "suggestion",
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
      const updatedHistory = [...chatHistory, { id: generatedChatId, messages: finalMessages }];
      localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));

      await fetch("http://localhost:8000/api/chat/save_log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: generatedChatId,
          messages: finalMessages,
        }),
      });
    } catch (error) {
      const errorMessage = {
        id: userMessage.id + 1,
        text: "⚠️ 请求失败，请检查网络或后端服务。",
        sender: "bot" as const,
      };
      setMessages([...updatedMessages, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 p-6 w-full h-[90vh] max-w-[1000px] mx-auto">
      {/* 语言选择 */}
      <div className="mb-4">
        <label className="font-semibold mr-2">{t("chat.select_language")}</label>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value as "zh" | "en")}
          className="border border-gray-300 p-1 rounded"
        >
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* 模型选择 */}
      <div className="mb-4">
        <label className="font-semibold mr-2">{("chat.select")}</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="border border-gray-300 p-1 rounded"
        >
          <option value="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free">DeepSeek</option>
          <option value="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free">LLaMA 3.3</option>
        </select>
      </div>

      {/* 标题与操作按钮 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Chat with AI</h1>
        <div className="flex space-x-2">
          <button
            onClick={clearChat}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t("chat.clear")}
          </button>
          <button
            onClick={() => {
              const chatId = localStorage.getItem("currentChatId");
              if (chatId) {
                router.push(`/survey?chat_id=${chatId}`);
              } else {
                alert("未找到当前 Chat ID，无法跳转");
              }
            }}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {t("chat.end")}
          </button>
        </div>
      </div>

      {/* 消息列表 + 评分 */}
      <MessageList messages={messages} chatId={generatedChatId} />

      {/* 底部输入框 */}
      <div className="mt-auto flex space-x-2 p-3 bg-white shadow-md rounded-lg">
        <Input value={inputValue} onChange={setInputValue} />
        <Button onClick={sendMessage} text="Send" />
      </div>
    </div>
  );
};

export default MyChat;
