'use client';

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import Rating from "./Rating"; // 引入评分组件

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  type?: "normal" | "suggestion"; // 后端传来的类型
}

interface MessageListProps {
  messages: Message[];
  chatId: string;
}

// 新增：根据内容关键词辅助判断是否是建议

const MessageList = ({ messages, chatId }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const [ratedMessages, setRatedMessages] = useState<{ [id: number]: number }>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const handleRate = async (messageId: number, score: number) => {
  console.log("📦 发送评分数据：", {
    chat_id: chatId,
    message_id: messageId,
    score
  });

  setRatedMessages((prev) => ({ ...prev, [messageId]: score }));

  const res = await fetch("http://localhost:8000/api/chat/rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      score,
    }),
  });

  if (!res.ok) {
    console.error("❌ 评分提交失败", await res.text());
  }
};




  return (
    <div className="flex flex-col space-y-3 overflow-y-auto max-h-[65vh] px-4 py-2 bg-white rounded-lg shadow-inner">
      {messages.map((msg) => {
        //  优先看后端是否明确标记为 suggestion
        const isSuggestion =
          msg.sender === "bot" && msg.type === "suggestion";

        const hasRated = ratedMessages[msg.id] !== undefined;
        const ratedScore = ratedMessages[msg.id];

        return (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-[75%] break-words ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-100 text-gray-900 self-start"
            }`}
          >
            <ReactMarkdown children={msg.text} />

            {/*  仅当 isSuggestion 时显示评分组件 */}
            {isSuggestion && (
              <div className="border-t pt-2 mt-2">
                <Rating
                  disabled={hasRated}
                  onRate={(score) => handleRate(msg.id, score)}
                  defaultScore={ratedScore}
                />
                {hasRated && (
                  <div className="text-sm text-gray-500 mt-1">
                    已评分 {ratedScore} 分
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};


export default MessageList;
