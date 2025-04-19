"use client";

import React from "react";

interface CandidateProps {
  terms: string[];
}

const Candidate: React.FC<CandidateProps> = ({ terms }) => {
  return (
    <div className="max-h-[200px] border border-red-400 rounded p-4 overflow-y-auto bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">术语推荐结果</h3>
      {terms.length === 0 ? (
        <p className="text-gray-500">暂无术语，请点击文件或按钮提取。</p>
      ) : (
        <ul className="list-disc pl-6 space-y-1">
          {terms.map((term, idx) => (
            <li key={idx}>{term}</li>
          ))}
        </ul>
      )}
    </div>
  );
};


export default Candidate;
