"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next"; // ✅ 使用 i18next 包自带实例
// ✅ 加这个
import { Lightbulb, FolderTree } from "lucide-react";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import {
  MessageOutlined,
  BulbOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface ChatSidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ sidebarOpen, toggleSidebar }) => {
  const router = useRouter();
  const collapsed = !sidebarOpen;
  const { t } = useTranslation("common");

  //  保存当前聊天记录
  const saveToHistory = () => {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    const currentChat = JSON.parse(localStorage.getItem("currentChat") || "[]");
  
    if (currentChat.length > 0) {
      chatHistory.push({ id: Date.now(), messages: currentChat });
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
      localStorage.removeItem("currentChat"); // 存入后清空当前对话
    }
  }

  //  侧边栏菜单项
  const items: MenuProps["items"] = [
  {
    key: "mychat",
    label: t("sidebar.chat.mychat"),
    icon: <Lightbulb />,
    onClick: () => {
      saveToHistory();
      router.push("/chat/MyChat");
    },
  },
  {
    key: "history",
    label: t("sidebar.chat.history"),
    icon: <FolderTree />,
    onClick: () => router.push("/chat/history"),
  },
];


  return (
    <div className={`h-screen bg-gray-800 text-white flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      {/* 顶部栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <span className={`text-xl font-bold ${collapsed ? "hidden" : "block"}`}>Chat</span>
        <button onClick={toggleSidebar}>
          {collapsed ? <ArrowRightOutlined className="text-white" /> : <ArrowLeftOutlined className="text-white" />}
        </button>
      </div>

      {/* 菜单 */}
      <Menu key={i18n.language} mode="inline" theme="dark" inlineCollapsed={collapsed} items={items} className="flex-1" />
    </div>
  );
};

export default ChatSidebar;