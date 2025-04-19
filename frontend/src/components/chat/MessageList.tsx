import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown"; // v7 用法

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ 每次 messages 更新时自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col space-y-3 overflow-y-auto max-h-[65vh] px-4 py-2 bg-white rounded-lg shadow-inner">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-3 rounded-lg max-w-[75%] break-words ${
            msg.sender === "user"
              ? "bg-blue-500 text-white self-end"
              : "bg-gray-100 text-gray-900 self-start"
          }`}
        >
          {msg.text}

        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
