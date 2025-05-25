"use client";
import React from "react";
import Nav from "./Nav";
import { UserIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function Header() {
  const { t, i18n } = useTranslation();

  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex items-center justify-between">
      {/* 左侧 Logo */}
      <div className="text-xl font-bold">TourRec</div>

      {/* 中间的导航 */}
      <Nav />

      {/* 右侧操作区域 */}
      <div className="flex items-center space-x-4">
        <LanguageSwitcher />
        <button className="border border-white px-3 py-1 rounded hover:bg-white hover:text-gray-900 transition">
          <UserIcon className="h-5 w-5 inline-block mr-2" />
          {i18n.isInitialized ? t("nav.sign_in") : "Loading..."}
        </button>
      </div>
    </header>
  );
}