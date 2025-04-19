"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface Node {
  id: string;
  name: string;
  color: string;
}

interface Link {
  source: string;
  target: string;
  label: string;
}

interface Triple {
  head: string;
  relation: string;
  tail: string;
}

type GraphData = { nodes: Node[]; links: Link[] };

export default function KGConstructionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("DeepSeek");
  const [triples, setTriples] = useState<Triple[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [showFileList, setShowFileList] = useState(false);
  const [fileList, setFileList] = useState<string[]>([]);

  const fgRef = useRef<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/terminology/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedFilename = res.data.filename;
      console.log("上传成功，文件名：", uploadedFilename);
      setFilename(uploadedFilename);
      alert("上传成功！");
    } catch (err) {
      console.error("上传失败", err);
      alert("上传失败！");
    }
  };

  const fetchFileList = async () => {
    try {
      const res = await axios.get("/api/terminology/list");
      setFileList(res.data.files || []);
    } catch (err) {
      console.error("文件列表获取失败", err);
    }
  };

  const handleExtract = async () => {
    if (!filename) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/kg/extract_triples_from_filename", {
        filename,
        prompt,
        model
      });
      const triplesData = res.data.triples as Triple[];
      setTriples(triplesData);

      const nodesMap = new Map<string, Node>();
      const links: Link[] = [];
      triplesData.forEach(({ head, relation, tail }) => {
        if (!nodesMap.has(head)) nodesMap.set(head, { id: head, name: head, color: "#4682B4" });
        if (!nodesMap.has(tail)) nodesMap.set(tail, { id: tail, name: tail, color: "#CD5C5C" });
        links.push({ source: head, target: tail, label: relation });
      });

      setGraphData({ nodes: Array.from(nodesMap.values()), links });
    } catch (err) {
      console.error("提取失败", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNeo4j = async () => {
    try {
      await axios.post("/api/kg/upload_triples", { triples });
      alert("上传成功！");
    } catch (err) {
      console.error("上传失败", err);
      alert("上传失败！");
    }
  };

  return (
    <div className="h-full bg-gray-100 p-4">
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* 左边操作区 */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4 flex flex-col gap-4">
          {/* 文件上传模块 */}
          <div
            className="border rounded-lg p-4 relative"
            onMouseEnter={() => {
              setShowFileList(true);
              fetchFileList();
            }}
            onMouseLeave={() => setShowFileList(false)}
          >
            <label className="block text-sm font-medium mb-2">选择文件上传</label>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="file"
                onChange={handleFileChange}
                className="flex-1 border rounded p-2"
              />
              <button
                onClick={handleUpload}
                disabled={!file}
                className={`p-2 rounded ${
                  file ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "bg-gray-300 text-gray-500"
                }`}
              >
                上传文件
              </button>
            </div>

            {/* 文件列表浮层 */}
            {showFileList && (
              <div className="absolute top-full mt-2 left-0 w-full bg-white border rounded shadow p-2 z-10 max-h-40 overflow-y-auto">
                {fileList.length ? (
                  fileList.map((f, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-700 truncate cursor-pointer hover:text-blue-500"
                      onClick={() => {
                        setFilename(f);
                        setShowFileList(false);
                      }}
                    >
                      {f}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">暂无文件</div>
                )}
              </div>
            )}

            {/* 当前选择文件提示 */}
            {filename && (
              <div className="text-xs text-gray-500 mt-1 truncate">
                当前选择文件：{filename}
              </div>
            )}
          </div>

          {/* Prompt 输入框 */}
          <div>
            <label className="block text-sm font-medium mb-2">输入 Prompt</label>
            <textarea
              className="mt-2 w-full border p-2 rounded"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="请在这里填写你的 Prompt"
            />
          </div>

          {/* 模型选择器 */}
          <div>
            <label className="block text-sm font-medium mb-2">选择模型</label>
            <select
              className="mt-2 w-full border p-2 rounded"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="DeepSeek">DeepSeek</option>
              <option value="Ollama7B">Ollama7B</option>
            </select>
          </div>

          {/* 操作按钮 */}
          <button
            onClick={handleExtract}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded p-2 mt-4"
          >
            {loading ? "提取中..." : "提取 Triples"}
          </button>
          <button
            onClick={handleUploadNeo4j}
            disabled={!triples.length}
            className="bg-green-500 hover:bg-green-600 text-white rounded p-2 mt-2"
          >
            上传到 Neo4j
          </button>
        </div>

        {/* 右边展示区 */}
        <div className="col-span-2 bg-white rounded-lg shadow p-4 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold mb-4">提取结果展示</h3>
          <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeLabel={(n: any) => n.name}
              linkLabel={(l: any) => l.label}
              nodeColor={(n: any) => n.color}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              width={undefined}
              height={undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
