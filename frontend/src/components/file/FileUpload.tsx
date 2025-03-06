import { useState } from "react";

interface FileUploadProps {
  onUploadSuccess: () => void; // 触发上传成功后的刷新
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async () => {
    if (!selectedFile) return alert("请选择要上传的文件！");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/files/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "文件上传失败");
      }

      alert(`文件 "${selectedFile.name}" 上传成功！`);
      setSelectedFile(null);
      onUploadSuccess();
    } catch (error) {
      console.error("文件上传失败:", error);
      alert(`上传失败: ${error}`);
    }
  };

  return (
    <div className="flex w-full items-center space-x-2 overflow-hidden">
      {/* ✅ 输入框占满剩余空间 */}
      <input
        type="file"
        accept=".owl,.rdf,.ttl"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        className="flex-grow border rounded-lg p-2 text-gray-700 min-w-0"
      />

      {/* ✅ 按钮固定宽度，防止溢出 */}
      <button
        onClick={handleFileUpload}
        className={`px-4 py-2 rounded-lg text-white min-w-[120px] max-w-[20%] ${
          selectedFile ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!selectedFile}
      >
        上传文件
      </button>
    </div>
  );
}
