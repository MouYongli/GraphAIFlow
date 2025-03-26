"use client";

import React from "react";

const TerminologyTips: React.FC = () => {
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-gray-800">
      <h2 className="font-semibold text-blue-700 mb-2">📂 上传的文件格式要求</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>支持格式：<code>.xlsx</code>、<code>.csv</code>、<code>.json</code></li>
        <li>文件中应包含“内容”列，将用于术语提取</li>
        <li>建议结构：
          <ul className="list-disc pl-6">
            <li><code>.xlsx</code>：可多列，请确保含有术语相关列</li>
            <li><code>.csv</code>：默认按第一行为表头</li>
            <li><code>.json</code>：推荐格式为 <code>{`{"terms": ["术语1", "术语2"]}`}</code></li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default TerminologyTips;
