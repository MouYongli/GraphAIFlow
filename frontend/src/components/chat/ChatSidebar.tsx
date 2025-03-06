"use client";

import React, { useState } from "react";
import { Lightbulb, Network, Link2, FolderTree } from "lucide-react";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import {
  MessageOutlined,
  SearchOutlined,
  UserOutlined,
  DatabaseOutlined,
  BulbOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";


const Sidebar: React.FC = () => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false); // 侧边栏开关

  // 侧边栏菜单项
  const items: MenuProps["items"] = [
    {
      key: "chats",
      icon: <BulbOutlined />,
      label: "Chat",
      children: [
        { key: "mychat", label: "MyChat", icon: <Lightbulb />, onClick: () => router.push("/chat"),},
        { key: "history", label: "History", icon: <FolderTree />, onClick: () => router.push("/chat/history"),},
      ],
    },
    {
      key: "settings",
      icon: <MessageOutlined />,
      label: "Use Settings",
      children: [
        { key: "profile", label: "Profile", onClick: () => router.push("/settings"), },
        { key: "feedback", label: "Feedback", onClick: () => router.push("/settings/feedback  "), },
      ],
    }
  ];

  return (
    <div className={`h-screen bg-gray-800 text-white flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      {/* 顶部栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <span className={`text-xl font-bold ${collapsed ? "hidden" : "block"}`}>Chat</span>
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ArrowRightOutlined className="text-white" /> : <ArrowLeftOutlined className="text-white" />}
        </button>
      </div>

      {/* 菜单 */}
      <Menu
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        defaultSelectedKeys={["ontology"]}
        defaultOpenKeys={["knowledge"]}
        items={items}
        className="flex-1"
      />
    </div>
  );
};

export default Sidebar;