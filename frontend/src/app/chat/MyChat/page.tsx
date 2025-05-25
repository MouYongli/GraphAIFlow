"use client";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MessageList from "@/components/chat/MessageList";
import Input from "@/components/chat/Input";
import Button from "@/components/chat/Button";

// 统一 chatId 格式生成函数
// 添加随机后缀，确保新 chatId 唯一，不影响旧数据
const generateChatId = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0"); // 加随机数
  return `frontend_chat_${yyyy}${MM}${dd}_${HH}${mm}${ss}_${rand}`;
};


const MyChat = () => {
  const [selectedLang, setSelectedLang] = useState<"zh" | "en">("zh");
  const [selectedModel, setSelectedModel] = useState("deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free");
  type MessageType = "normal" | "suggestion" | "language";
  const [messages, setMessages] = useState<
    { id: number; text: string; sender: "user" | "bot"; type?: MessageType }[]
  >([]);

  const [inputValue, setInputValue] = useState("");
  const [generatedChatId, setGeneratedChatId] = useState("");

  const [langSelected, setLangSelected] = useState(false); // 是否已选语言

  const handleLangSelect = (lang: "zh" | "en") => {
    setSelectedLang(lang);
    setLangSelected(true);

    const welcome = {
      id: Date.now(),
      text:
        lang === "zh"
          ? "想看、想吃、想玩什么？我来推荐北京值得去的地方！当前系统暂不支持住宿和交通路线哦～"
          : " What do you want to see, eat or do? Tell me your interests and I'll recommend places to visit in Beijing! The current system does not support accommodation and transportation routes at present",
      sender: "bot" as const,
    };

    const updatedMessages = [...messages, welcome];
    setMessages(updatedMessages);
    localStorage.setItem("currentChat", JSON.stringify(updatedMessages));
  };




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
        text: "👋 很高兴见到你！首先，请选择语言 / Nice to meet you! Please select a language first:",
        sender: "bot" as const,
        type: "language" as const 
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

  const isGeneralQuestion = (text: string) => {
  const keywords = [ "我从没来过北京","完全不懂北京", "请告诉我去哪玩"];
  return keywords.some((kw) => text.includes(kw));
};


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

        // ✅ 如果是泛化问题，直接生成引导语，跳过后端推荐流程
    if (isGeneralQuestion(inputValue)) {
      const botGuideMessage = {
        id: userMessage.id + 1,
        sender: "bot" as const,
        text:
          selectedLang === "zh"
            ? "北京有很多值得探索的地方，比如故宫、长城、颐和园、小吃街等。\n你想了解哪方面的推荐呢？是景点、美食、活动，还是最适合前往的时间？"
            : "There are many great places to explore in Beijing, such as the Forbidden City, the Great Wall, the Summer Palace, and local food streets.\nWould you like recommendations for attractions, food, activities, or the best time to visit?",
      };
      setMessages([...updatedMessages, botGuideMessage]);
      return;
    }


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

      const updatedHistory = (() => {
        const existing = chatHistory.find((chat: any) => chat.id === generatedChatId);
        if (existing) {
          return chatHistory.map((chat: any) =>
            chat.id === generatedChatId ? { ...chat, messages: finalMessages } : chat
          );
        } else {
          return [...chatHistory, { id: generatedChatId, messages: finalMessages }];
        }
      })();

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
      

      {/* 模型选择 */}
      <div className="mb-4">
        <label className="font-semibold mr-2">{t("chat.select_model")}</label>
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
      <MessageList messages={messages} chatId={generatedChatId} onSelectLang={handleLangSelect}/>

      {/* 底部输入框 */}
      <div className="mt-auto flex space-x-2 p-3 bg-white shadow-md rounded-lg">
        <Input value={inputValue} onChange={setInputValue} onSend={sendMessage} />

        <Button onClick={sendMessage} text="Send" />
      </div>
    </div>
  );
};

export default MyChat;
