"use client";

import React, { useState, useRef } from "react";
import UploadFile from "./UploadFile";
import FileList from "./FileList";
import Candidate from "./Candidate";

export default function UploadManager() {
  const [terms, setTerms] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    <div className="relative w-full p-4 border rounded-lg shadow bg-gray-50">
      {/* 上传区域（鼠标悬浮控制文件列表） */}
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <UploadFile onUploadSuccess={() => {}} />
        {showDropdown && (
          <div className="absolute left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-20">
            <FileList
              onExtractTerms={(filename, terms) => {
                setTerms(terms); // 直接更新术语
              }}
            />
          </div>
        )}
      </div>

      {/* ✅ 展示术语候选 */}
      <Candidate terms={terms} />
    </div>
  );
}
