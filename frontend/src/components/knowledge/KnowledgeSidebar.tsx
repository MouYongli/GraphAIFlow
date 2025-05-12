"use client";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("common");

  const [collapsed, setCollapsed] = useState(false); // 侧边栏开关

  // 侧边栏菜单项
  const items: MenuProps["items"] = [
    {
      key: "overview",
      icon: <BulbOutlined />,
      label: t("sidebar.knowledge.visualization"),
      children: [
        { key: "ontology", label: t("sidebar.knowledge.ontology.title"), icon: <Lightbulb />, onClick: () => router.push("/knowledge/ontology") },
        { key: "hierarchy", label: t("sidebar.knowledge.hierarchy"), icon: <FolderTree />, onClick: () => router.push("/knowledge/ontology/hierarchy") },
        { key: "KG", label: t("sidebar.knowledge.graph.title"), icon: <Lightbulb />, onClick: () => router.push("/knowledge/ontology/KG") }
      ],
    },
    {
      key: "graphs",
      icon: <MessageOutlined />,
      label: t("sidebar.knowledge.graphs"),
      children: [
        {
          key: "terminology",
          label: t("sidebar.knowledge.terminology_update"),
          onClick: () => router.push("/knowledge/graph"),
        },
        {
          key: "processing",
          label: t("sidebar.knowledge.kg_construction"),
          onClick: () => router.push("/knowledge/graph/KGConstruction"),
        },
      ],
    },
    {
      key: "rec",
      icon: <MessageOutlined />,
      label: t("sidebar.knowledge.recommendation"),
      children: [
        {
          key: "chat",
          label: t("sidebar.knowledge.chat_interface"),
          onClick: () => router.push("/chat"),
        },        
        {
          key: "pipeline",
          label: t("sidebar.knowledge.recommendation_pipeline"),
          onClick: () => router.push("/knowledge/recommendationSystem"),
        },
      ],
    },
  ];
  

  return (
    <div className={`min-h-screen bg-gray-800 text-white flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
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
        className="flex-1 overflow-y-auto"
      />
    </div>
  );
};

export default Sidebar;