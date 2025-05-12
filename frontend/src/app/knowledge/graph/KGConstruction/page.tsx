"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { useTranslation } from "react-i18next";



const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const BASE_URL = "http://localhost:8000";

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

export default function KGConstructionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [fileList, setFileList] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("DeepSeek");
  const [triples, setTriples] = useState<Triple[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [textRows, setTextRows] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const fgRef = useRef<any>(null);
  const { t } = useTranslation("common");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const hoverRef = useRef<NodeJS.Timeout | null>(null);
  const promptTemplates: { label: string; content: string }[] = [
    {
      label: "本体约束提取模板（NER+RE）",
      content: `你是一个信息抽取系统，请从旅游文本中提取出包含“实体-关系-实体”的三元组，格式如下：
  [
    { "head": "后海", "relation": "locatedIn", "tail": "北京" },
    { "head": "四季民福", "relation": "hasRecommendCuisine", "tail": "烤鸭" }
  ]
  ⚠️ 注意事项：
  - 实体类别仅允许：City, TouristAttraction, Restaurant, ActivityAndExperience, ReviewAndFeedback, Time, RecommendCuisine；
  - 关系类别仅允许：
    1. locatedIn
    2. hasRecommendCuisine
    3. hasActivityExperience
    4. isHeldOn
    5. bestTimeToVisit
    6. hasReviewAndFeedback
  - 输出必须是 JSON 格式数组，不需要解释，不添加备注；
  - 所有内容必须来自原文中明确提及；
  - 若无三元组，返回空列表 []；
  - 请勿扩展额外内容。`,
    },
    {
      label: "标准三元组提取模板",
      content: `请从以下文本中提取三元组，格式如下：
  [
    { "head": "...", "relation": "...", "tail": "..." }
  ]
  只返回 JSON，不要解释，不要输出除三元组外的内容。`,
    },
    {
      label: "快速测试模板",
      content: `从文本中抽取实体之间的三元组（head, relation, tail），格式为 JSON 列表。无需解释说明。`,
    },
  ];
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("save", "true");
    try {
      await axios.post(`${BASE_URL}/api/terminology/upload`, formData);
      alert("上传成功！");
      fetchFileList();
    } catch (err) {
      alert("上传失败！");
    }
  };

  const fetchFileList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/terminology/list`);
      setFileList(res.data.files);
    } catch (err) {
      console.error("文件列表获取失败", err);
    }
  };

  const handleExtract = async () => {
    if (!filename) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/terminology/extract_texts?filename=${filename}`);
      const texts: string[] = res.data.texts;
      setTextRows(texts);

      const results: Triple[] = [];
      const statusList: string[] = [];

      for (const [index, row] of texts.entries()) {
        try {
          const response = await axios.post(`${BASE_URL}/api/kg/extract_triples_from_text`, {
            text: row,
            prompt,
            model,
          });
          results.push(...response.data.triples);
          statusList.push(`第 ${index + 1} 条：成功 ✅`);
        } catch (e) {
          statusList.push(`第 ${index + 1} 条：失败 ❌`);
        }
      }
      setTriples(results);
      setStatuses(statusList);

      const nodesMap = new Map<string, Node>();
      const links: Link[] = [];
      results.forEach(({ head, relation, tail }) => {
        if (!nodesMap.has(head)) nodesMap.set(head, { id: head, name: head, color: "#4682B4" });
        if (!nodesMap.has(tail)) nodesMap.set(tail, { id: tail, name: tail, color: "#CD5C5C" });
        links.push({ source: head, target: tail, label: relation });
      });
      setGraphData({ nodes: Array.from(nodesMap.values()), links });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNeo4j = async () => {
    try {
      await axios.post(`${BASE_URL}/api/kg/upload_triples`, { triples });
      alert("上传成功！");
    } catch (err) {
      alert("上传失败！");
    }
  };

  return (
    <div className="h-full p-4 bg-gray-100">
      <div className="grid grid-cols-3 gap-4 h-full">
        <div className="col-span-1 bg-white rounded-lg shadow p-4 space-y-4">
          <label className="block text-sm font-semibold text-gray-700">{t("kg.upload_label")}</label>
          <div
            className="w-full bg-white border p-4 rounded-lg shadow relative"
            onMouseEnter={() => {
              if (hoverRef.current) clearTimeout(hoverRef.current);
              setShowDropdown(true);
              fetchFileList();
            }}
            onMouseLeave={() => {
              hoverRef.current = setTimeout(() => setShowDropdown(false), 200);
            }}
          >
            <div className="w-full flex gap-2 mb-2">
              <input type="file" className="w-full border p-2 rounded text-sm" onChange={handleFileChange} />
              <button onClick={handleUpload} className="shrink-0 bg-gray-300 px-4 py-2 rounded text-gray-800 hover:bg-gray-400 text-sm">
              {t("kg.upload_button")}
              </button>
            </div>
            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border rounded shadow z-20 max-h-52 overflow-y-auto text-sm">
                {fileList.length ? (
                  fileList.map((f) => (
                    <div key={f} className="flex justify-between items-center px-3 py-2 hover:bg-blue-50 cursor-pointer">
                      <span onClick={() => { setFilename(f); setShowDropdown(false); }} className="text-blue-600 hover:underline truncate max-w-[75%]" title={f}>
                        {f}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 px-2 py-1">暂无文件</div>
                )}
              </div>
            )}
            {filename && <div className="text-xs text-gray-500 mt-2 truncate">当前选择文件：{filename}</div>}
          </div>

          {/* 快捷 Prompt 模板 */}
      

          <select
            className="w-full border p-2 rounded"
            value={selectedTemplate}
            onChange={(e) => {
              const selectedLabel = e.target.value;
              const selected = promptTemplates.find((p) => p.label === selectedLabel);
              if (selected) {
                setSelectedTemplate(selected.label);
                setPrompt(selected.content);
              }
            }}
          >
            <option value="" disabled>{t("kg.select_prompt")}</option>
            {promptTemplates.map((tpl) => (
              <option key={tpl.label} value={tpl.label}>{tpl.label}</option>
            ))}
          </select>


          <textarea
            placeholder="请在这里填写你的 Prompt"
            className="w-full border p-2 rounded"
            rows={10}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />


          <select
            className="w-full border p-2 rounded"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="deepseek-r1:1.5b">deepseek-r1:1.5b</option>
            <option value="deepseek-r1:7b">deepseek-r1:7b</option>
            <option value="deepseek-r1:70b">deepseek-r1:70b</option>
            <option value="llama3:1:8b">llama3:1:8b</option>
            <option value="llama3.3:70b">llama3.3:70b</option>
          </select>

          <button
            onClick={handleExtract}
            disabled={loading || !filename}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded p-2 w-full"
          >
            {loading ? t("kg.extracting") : t("kg.extract_button")}
          </button>

          <button
            onClick={handleUploadNeo4j}
            disabled={!triples.length}
            className="bg-green-500 hover:bg-green-600 text-white rounded p-2 w-full"
          >
            {t("kg.upload_button")}
          </button>

          {statuses.length > 0 && (
            <div className="mt-4 text-sm space-y-1">
              <strong>{t("kg.status_title")}</strong>
              {statuses.map((s, i) => <div key={i}>{s}</div>)}
            </div>
          )}
        </div>

        <div className="col-span-2 bg-white rounded-lg shadow p-4 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold mb-4">{t("kg.result_display")}</h3>
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