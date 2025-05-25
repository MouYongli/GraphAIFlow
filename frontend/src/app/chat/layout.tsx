"use client";
import React, { useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar"; // ✅ 确保路径正确

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex min-h-screen">
      {/* 侧边栏组件 */}
      <ChatSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* 主内容 */}
      <main className="flex-1 p-4 bg-white text-gray-900">
        {children}
      </main>
    </div>
  );
}