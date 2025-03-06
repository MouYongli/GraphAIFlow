"use client";

import { useState, useRef } from "react";
import FileList from "./FileList";
import FileUpload from "./FileUpload";

interface FileUploadManagerProps {
  onRefresh: () => void;
  onParseFile: (filename: string) => void;
}

export default function FileUploadManager({ onRefresh, onParseFile }: FileUploadManagerProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 鼠标进入时打开列表
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  // 鼠标离开时延迟关闭，避免列表瞬间消失
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  return (
    <div 
      className="relative w-full p-4 border rounded-lg shadow bg-gray-50"
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      {/* ✅ 直接使用 `FileUpload` 组件，不再单独创建 `input type="file"` */}
      <FileUpload onUploadSuccess={onRefresh} />

      {/* ✅ 文件列表（确保不会因 hover 间隙消失） */}
      {isDropdownOpen && (
        <div className="absolute left-0 w-full bg-white border rounded-lg shadow-lg mt-2 z-10">
          <FileList onDelete={onRefresh} onParseFile={onParseFile} />
        </div>
      )}
    </div>
  );
}
