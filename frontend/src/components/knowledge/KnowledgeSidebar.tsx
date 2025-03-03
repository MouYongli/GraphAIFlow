"use strict";
import React, { useState } from "react";
import { TbBinaryTreeFilled } from "react-icons/tb";
import { PiShareNetworkFill } from "react-icons/pi";
import Link from "next/link";
import {
  LightBulbIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from 'react-i18next';


export default function KnowledgeSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const { t } = useTranslation();

  return (
    <aside
      className={`flex flex-col bg-gray-800 text-white ${
        sidebarOpen ? "w-64" : "w-16"
      } transition-all duration-300`}
    >
      {/* 顶部区域 */}
      <div className="border-b border-gray-700">
        {sidebarOpen ? (
          /* 展开状态 */
          <div className="flex items-center justify-between p-4">
            {/* 左侧：图标 + 文字 */}
            <div className="flex items-center space-x-2">
              <LightBulbIcon className="h-6 w-6" />
              <span className="text-xl font-bold whitespace-nowrap">
                {t('sidebar.knowledge.title')}
              </span>
            </div>
            {/* 右侧：收起按钮 */}
            <button onClick={toggleSidebar}>
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          /* 收起状态 */
          <div className="flex items-center justify-between p-4">
            {/* 左侧：图标 + 简写“K” */}
            <div className="flex items-center space-x-2">
              <LightBulbIcon className="h-6 w-6" />
              {/* 右侧：展开按钮 */}
              <button onClick={toggleSidebar}>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>

          </div>
        )}
      </div>

      {/* 菜单列表 */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Ontology */}
        <Link
          href="/knowledge/ontology"
          className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer"
          title="Ontology" // 收起时鼠标悬停可显示原生title
        >
          {/* <CubeTransparentIcon className="h-6 w-6" /> */}
          <TbBinaryTreeFilled className="h-6 w-6" />
          {sidebarOpen && <span className="ml-2">{t('sidebar.knowledge.ontology.title')}</span>}
        </Link>

        {/* Knowledge Graphs */}
        <Link
          href="/knowledge/graphs"
          className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer"
          title="Knowledge Graphs"
        >
          <PiShareNetworkFill className="h-6 w-6" />
          {sidebarOpen && <span className="ml-2">{t('sidebar.knowledge.graph.title')}</span>}
        </Link>
      </nav>
    </aside>
  );
}