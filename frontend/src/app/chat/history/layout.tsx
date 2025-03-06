"use client";

import React from "react";

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 p-4 bg-white text-gray-900">
      {children}
    </main>
  );
}
