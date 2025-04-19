"use client";
import { useState } from "react";

export default function TerminologyTips() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-4 border border-blue-200 rounded-md bg-blue-50 text-sm text-gray-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-2 font-semibold text-blue-700 hover:underline"
      >
        📂 上传文件格式要求 {expanded ? "▲" : "▼"}
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <ul className="list-disc pl-6 space-y-1">
            <li>
              支持格式：<code>.xlsx</code>、<code>.csv</code>
            </li>
            <li>文件中应包含“内容”列，将用于术语提取</li>
            <li>
              建议结构：
              <ul className="list-disc pl-6">
                <li>
                  <code>.xlsx</code>：可多列，请确保含有术语相关列
                </li>
                <li>
                  <code>.csv</code>：默认表头名为“内容”为目标提取列
                </li>
              </ul>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
