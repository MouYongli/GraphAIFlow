"use client";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import React, { useState } from "react";
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

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [collapsed, setCollapsed] = useState(false);

  // 包装函数，collapsed 时启用 Tooltip
  const wrap = (label: string) =>
    collapsed ? (
      <Tooltip title={label} placement="right">
        <span>{label}</span>
      </Tooltip>
    ) : (
      label
    );

  const items: MenuProps["items"] = [
    {
      key: "overview",
      icon: <BulbOutlined />,
      label: wrap(t("sidebar.knowledge.visualization")),
      title: t("sidebar.knowledge.visualization"),
      children: [
        {
          key: "ontology",
          icon: <Lightbulb />,
          label: wrap(t("sidebar.knowledge.ontology.title")),
          title: t("sidebar.knowledge.ontology.title"),
          onClick: () => router.push("/knowledge/ontology"),
        },
        {
          key: "hierarchy",
          icon: <FolderTree />,
          label: wrap(t("sidebar.knowledge.hierarchy")),
          title: t("sidebar.knowledge.hierarchy"),
          onClick: () => router.push("/knowledge/ontology/hierarchy"),
        },
        {
          key: "KG",
          icon: <Lightbulb />,
          label: wrap(t("sidebar.knowledge.graph.title")),
          title: t("sidebar.knowledge.graph.title"),
          onClick: () => router.push("/knowledge/ontology/KG"),
        },
      ],
    },
    {
      key: "graphs",
      icon: <MessageOutlined />,
      label: wrap(t("sidebar.knowledge.graphs")),
      title: t("sidebar.knowledge.graphs"),
      children: [
        {
          key: "terminology",
          label: wrap(t("sidebar.knowledge.terminology_update")),
          title: t("sidebar.knowledge.terminology_update"),
          onClick: () => router.push("/knowledge/graph"),
        },
        {
          key: "processing",
          label: wrap(t("sidebar.knowledge.kg_construction")),
          title: t("sidebar.knowledge.kg_construction"),
          onClick: () => router.push("/knowledge/graph/KGConstruction"),
        },
      ],
    },
    {
      key: "rec",
      icon: <MessageOutlined />,
      label: wrap(t("sidebar.knowledge.recommendation")),
      title: t("sidebar.knowledge.recommendation"),
      children: [
        {
          key: "chat",
          label: wrap(t("sidebar.knowledge.chat_interface")),
          title: t("sidebar.knowledge.chat_interface"),
          onClick: () => router.push("/chat"),
        },
        {
          key: "pipeline",
          label: wrap(t("sidebar.knowledge.recommendation_pipeline")),
          title: t("sidebar.knowledge.recommendation_pipeline"),
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

      {/* 菜单区域 */}
      <Menu
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        defaultSelectedKeys={["ontology"]}
        defaultOpenKeys={["overview"]}
        items={items}
        className="flex-1 overflow-y-auto"
      />
    </div>
  );
};

export default Sidebar;
