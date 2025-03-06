"use client";
import React, { useState } from "react";
import KnowledgeSidebar from "@/components/knowledge/KnowledgeSidebar";

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex min-h-screen">
      <KnowledgeSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      {/* 页面内容 */}
      <main className="flex-1 p-4 bg-white text-gray-900">
        {children}
      </main>
    </div>
  );
}
