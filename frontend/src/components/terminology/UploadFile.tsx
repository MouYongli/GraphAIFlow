"use client";

import React, { useRef, useState } from "react";

interface UploadFileProps {
  onUploadSuccess: (filename: string) => void;
}

const UploadFile: React.FC<UploadFileProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null); // 👈 引入 input ref

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("save", "true");

    try {
      const res = await fetch("/api/terminology/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.filename) {
        alert(`上传成功: ${data.filename}`);
        onUploadSuccess(data.filename);
        setSelectedFile(null); // ✅ 重置状态
        const inputElem = document.getElementById("file-input") as HTMLInputElement;
        if (inputElem) inputElem.value = ""; // ✅ 清空文件输入框
      } else {
        alert("上传失败");
      }
    } catch (err) {
      console.error("上传失败:", err);
      alert("上传失败");
    }
  };

  return (
    <div className="flex w-full items-center space-x-2">
      <input
        ref={inputRef}
        id="file-input"
        type="file"
        accept=".csv,.xlsx,.json"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        className="flex-grow border rounded-lg p-2 text-gray-700 min-w-0"
      />
      <button
        onClick={handleUpload}
        className={`px-4 py-2 rounded-lg text-white min-w-[120px] max-w-[20%] ${
          selectedFile ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!selectedFile}
      >
        上传术语文件
      </button>
    </div>
  );
};

export default UploadFile;
