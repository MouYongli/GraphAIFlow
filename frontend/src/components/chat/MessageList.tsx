import React from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: { messages: { id: number; text: string; sender: "user" | "bot" }[] }) => {
    return (
      <div className="flex flex-col space-y-3 overflow-y-auto h-[400px] px-4 py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-xs ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
    );
  };
  
export default MessageList;
