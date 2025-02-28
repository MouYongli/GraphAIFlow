"use client";

import React from "react";
import Nav from "./Nav";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex items-center justify-between">
      {/* 左侧 Logo */}
      <div className="text-xl font-bold">MyLogo</div>

      {/* 中间的导航 */}
      <Nav />

      {/* 右侧操作区域：示例 Sign In 按钮 */}
      <button className="border border-white px-3 py-1 rounded hover:bg-white hover:text-gray-900 transition">
        Sign In
      </button>
    </header>
  );
}
