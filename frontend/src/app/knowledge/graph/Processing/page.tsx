'use client';

import React, { useRef, useState } from 'react';

export default function ProcessingPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [hovering, setHovering] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 触发文件选择
  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  // 选择文件：不立即上传，只展示
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  // 上传到后端
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append('files', file); // 支持多文件上传
    });

    try {
      const res = await fetch('/api/terminology/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('上传失败');
      }

      alert('上传成功 ✅');
    } catch (err) {
      alert('上传失败 ❌');
      console.error(err);
    }
  };

  // 点击文件名 → 读取内容
  const handleFileClick = async (file: File) => {
    const text = await file.text();
    setSelectedContent(text);
  };

  return (
    <div className="flex flex-row w-full h-screen p-6 space-x-4 bg-gray-50">
      {/* 左侧区域 */}
      <div className="flex flex-col w-2/3 space-y-4 relative">
        {/* 上传区域 */}
        <div
          className="relative"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {/* 隐藏 input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* 输入框 + 上传按钮 */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              onClick={triggerFileDialog}
              value={uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name).join(', ') : '选择文件 未选择文件'}
              readOnly
              className="border border-gray-400 rounded px-3 py-2 w-full bg-white text-gray-800 cursor-pointer"
            />
            <button
              onClick={handleUpload}
              className="min-w-[60px] h-[38px] px-3 border border-gray-300 text-gray-800 bg-white rounded hover:bg-gray-100 text-sm"
            >
              上传
            </button>
          </div>

          {/* 浮窗展示文件名 */}
          {hovering && uploadedFiles.length > 0 && (
            <div className="absolute z-20 top-full mt-1 w-full border border-gray-300 rounded bg-white shadow-md max-h-40 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <button
                  key={index}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-blue-600 truncate"
                  onClick={() => handleFileClick(file)}
                >
                  {file.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 模型选择 */}
        <input
          type="text"
          placeholder="choose model"
          className="border border-gray-400 rounded px-3 py-2 w-full"
        />

        {/* 内容区域 */}
        <textarea
          value={selectedContent || ''}
          readOnly
          className="flex-1 border border-gray-400 rounded px-4 py-3 text-gray-800 bg-white h-[300px]"
          placeholder="点击上方文件名后显示内容"
        ></textarea>
      </div>

      {/* 右侧结果展示 */}
      <div className="w-1/3 border border-gray-400 rounded px-4 py-3 bg-white text-gray-800">
        <h2 className="font-semibold text-base mb-2">识别结果展示</h2>
        <p className="text-sm text-gray-600">
          present the recognized entities and relations from the text
        </p>
      </div>
    </div>
  );
}
