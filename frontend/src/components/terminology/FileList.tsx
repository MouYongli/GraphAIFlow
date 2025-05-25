"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
interface FileListProps {
  onExtractTerms: (filename: string, terms: string[]) => void;
}

const FileList: React.FC<FileListProps> = ({ onExtractTerms }) => {
  const [files, setFiles] = useState<string[]>([]);
  const { t } = useTranslation("common");
  // 拉取文件列表
  const fetchFiles = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/terminology/list");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error("获取文件列表失败:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // 删除文件
  const handleDelete = async (filename: string) => {
    if (!confirm(`确定要删除文件 ${filename} 吗？`)) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/terminology/delete?filename=${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("删除失败");
      alert("✅ 删除成功！");
      fetchFiles();
    } catch (error) {
      console.error("删除失败：", error);
      alert("❌ 删除失败：" + error);
    }
  };

  // 点击文件：自动获取列 + 提取术语
  // 点击文件：直接提取术语（由后端自动识别“内容”列）
  const handleExtractTerms = async (filename: string) => {
    try {
      const termRes = await fetch(`http://127.0.0.1:8000/api/terminology/extract?filename=${encodeURIComponent(filename)}`);

      if (!termRes.ok) {
        throw new Error("接口请求失败，状态码：" + termRes.status);
      }
      const termData = await termRes.json();

      const terms = termData.candidates || [];
      onExtractTerms(filename, terms);
    } catch (err) {
      console.error("提取术语失败：", err);
      alert("术语提取失败，请检查接口或文件内容");
    }
  };
  


  return (
    <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-lg mt-1 z-10">
      {files.length === 0 ? (
        <div className="p-2 text-gray-500">{t("terminology.no_file")}</div>
      ) : (
        files.map((file) => (
          <div
            key={file}
            className="flex justify-between items-center p-2 border-b hover:bg-gray-100"
          >
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => handleExtractTerms(file)}
            >
              {file}
            </span>
            <button
              className="text-red-500 text-sm hover:text-red-700"
              onClick={() => handleDelete(file)}
            >
              {t("terminology.delete")}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default FileList;
