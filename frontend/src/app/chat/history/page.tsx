"use client";

import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import Link from "next/link";

// ✅ 时间戳转统一 chatId 格式（不需要用 i18n）
const formatChatId = (date: Date) => {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `frontend_chat_${yyyy}${MM}${dd}_${HH}${mm}${ss}`;
};

// ✅ chatId 转 readable 中文时间
const parseReadableTime = (chatId: string) => {
  const match = chatId.match(/frontend_chat_(\d{8})_(\d{6})/);
  if (!match) return chatId;

  const [_, date, time] = match;
  return `${date.slice(0, 4)}/${date.slice(4, 6)}/${date.slice(6, 8)} ${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`;
};

interface ChatRecord {
  id: string;
  messages: any[];
}

const ChatHistory = () => {
  const { t } = useTranslation("common"); // ✅ 正确使用 Hook
  const [history, setHistory] = useState<ChatRecord[]>([]);

  useEffect(() => {
    const rawHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    const filtered = rawHistory.filter((chat: any) => typeof chat.id === "string");
    setHistory(filtered);
  }, []);

  const handleDelete = async (idToDelete: string) => {
    const confirmed = confirm(t("chat.confirm_delete"));
    if (!confirmed) return;

    const updatedHistory = history.filter(chat => chat.id !== idToDelete);
    localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
    setHistory(updatedHistory);

    try {
      const res = await fetch(`/api/chat/delete/${idToDelete}`, {
        method: "DELETE"
      });
      if (!res.ok) console.warn(`后端删除失败: ${idToDelete}`);
    } catch (err) {
      console.error("删除后端聊天记录出错:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">{t("chat.history_title")}</h1>
      {history.length === 0 ? (
        <p className="text-gray-500">{t("chat.no_history")}</p>
      ) : (
        <ul className="space-y-4">
          {history.map((chat) => (
            <li key={chat.id} className="p-4 border rounded-lg flex justify-between items-center">
              <Link href={`/chat/history/${chat.id}`}>
                <span className="text-blue-500 cursor-pointer">
                  {t("chat.chat_from")} {parseReadableTime(chat.id)}
                </span>
              </Link>
              <button
                onClick={() => handleDelete(chat.id)}
                className="text-red-500 hover:underline"
              >
                {t("chat.delete")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatHistory;
