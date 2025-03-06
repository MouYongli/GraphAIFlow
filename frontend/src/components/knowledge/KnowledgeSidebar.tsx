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
      key: "ontology",
      icon: <BulbOutlined />,
      label: "Ontology",
      children: [
        { key: "overview", label: "Overview", icon: <Lightbulb />, onClick: () => router.push("/knowledge/ontology"),},
        { key: "hierarchy", label: "Hierarchy", icon: <FolderTree />, onClick: () => router.push("/knowledge/ontology/hierarchy"),},
        { key: "entities", label: "Entities", icon: <Link2 /> },
        { key: "relations", label: "Relations", icon: <Network /> },
      ],
    },
    {
      key: "graphs",
      icon: <MessageOutlined />,
      label: "Knowledge Graphs",
      children: [
        { key: "general", label: "General" },
        { key: "processing", label: "Processing" },
        { key: "result", label: "Visualization" },
      ],
    },
    {
      key: "rec",
      icon: <MessageOutlined />,
      label: "Recommendation System",
    },
    {
      key: "db",
      icon: <MessageOutlined />,
      label: "Database",
    },
  ];

  return (
    <div className={`h-screen bg-gray-800 text-white flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      {/* 顶部栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <span className={`text-xl font-bold ${collapsed ? "hidden" : "block"}`}>Knowledge</span>
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