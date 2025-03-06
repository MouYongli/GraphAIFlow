"use client";
import React from "react";

export default function MyChatLayout({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;  // 不要再加 ChatSidebar
}
