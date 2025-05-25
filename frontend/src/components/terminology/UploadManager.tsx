"use client";

import React, { useState, useRef } from "react";
import UploadFile from "./UploadFile";
import FileList from "./FileList";
import Candidate from "./Candidate";
import { useTranslation } from "react-i18next";


interface UploadManagerProps {
  onTermsExtracted?: (terms: string[]) => void;
  ontologyStructure: string;
  onOntologyStructureChange: (text: string) => void;
  onSuggestClick: () => void;
}

export default function UploadManager({
  onTermsExtracted,
  ontologyStructure,
  onOntologyStructureChange,
  onSuggestClick,
}: UploadManagerProps) {
  const [terms, setTerms] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useTranslation("common");
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 300);
  };

  return (
    <div className="relative w-full p-4 border rounded-lg shadow bg-gray-50 flex flex-col gap-4">
      {/* 上传区域 */}
      <div
        className="relative h-[50px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <UploadFile onUploadSuccess={() => {}} />
        {showDropdown && (
          <div className="absolute left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-20 gap-4">
            <FileList
              onExtractTerms={(filename, terms) => {
                setTerms(terms);
                onTermsExtracted?.(terms);
              }}
            />
          </div>
        )}
      </div>

      {/* 术语列表显示（不再 flex-1，而是 max height） */}
      <div className="max-h-[300px] overflow-y-auto">
        <Candidate terms={terms} />
      </div>

      {/* 本体结构输入 */}
      <textarea
        placeholder="请输入本体层级结构文本（如从 Hierarchy 复制）"
        className="w-full p-2 border rounded resize-y"
        rows={5}
        value={ontologyStructure}
        onChange={(e) => onOntologyStructureChange(e.target.value)}
      />

      {/* 获取建议按钮 */}
      <button
        onClick={onSuggestClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-fit"
      >
        ✨ {t("terminology.suggest_button")}
      </button>
    </div>
  );
}
