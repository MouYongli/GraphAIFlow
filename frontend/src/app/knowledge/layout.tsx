"use client";
import React, { useState } from "react";
import KnowledgeSidebar from "@/components/knowledge/KnowledgeSidebar";

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-screen overflow-y-auto">
      <KnowledgeSidebar/>
      {/* 页面内容 */}
      <main className="flex-1 p-4 bg-white text-gray-900">
        {children}
      </main>
    </div>
  );
}
