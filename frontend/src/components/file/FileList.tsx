import { useState, useEffect } from "react";

interface FileListProps {
  onDelete: (filename: string) => void;
  onParseFile: (filename: string) => void;  // ✅ 传递解析方法
}

export default function FileList({ onDelete, onParseFile }: FileListProps) {
  const [files, setFiles] = useState<string[]>([]);

  // 获取文件列表
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/files/");
        if (!response.ok) throw new Error("无法获取文件列表");
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("获取文件列表失败:", error);
      }
    };
    fetchFiles();
  }, []);

  return (
    <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-lg mt-1">
      {files.length === 0 ? (
        <div className="p-2 text-gray-500">暂无文件</div>
      ) : (
        files.map((file) => (
          <div key={file} className="flex justify-between p-2 border-b hover:bg-gray-100">
            {/* ✅ 点击文件触发 onParseFile */}
            <span className="text-blue-600 cursor-pointer" onClick={() => onParseFile(file)}>
              {file}
            </span>
            {/* 删除文件 */}
            <button onClick={() => onDelete(file)} className="text-red-500 hover:underline">
              删除
            </button>
          </div>
        ))
      )}
    </div>
  );
}
