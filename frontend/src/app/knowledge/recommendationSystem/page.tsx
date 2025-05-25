'use client';

import React, { useState } from 'react';
import { useTranslation } from "react-i18next";



export default function RecommendationPage() {
  const [userInput, setUserInput] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [parsedInfo, setParsedInfo] = useState('');
  const [cypherQuery, setCypherQuery] = useState('');
  const [graphResults, setGraphResults] = useState<string[]>([]);
  const [finalRecommendation, setFinalRecommendation] = useState('');
  const [translatedInput, setTranslatedInput] = useState('');
  const [usedEntities, setUsedEntities] = useState<any[]>([]);


  const { t } = useTranslation("common");
  const [lang, setLang] = useState('zh'); // 默认中文，可选 'zh' | 'en'

  const handleGenerate = async () => {
    const res = await fetch('http://localhost:8000/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: userInput,
        prompt: promptInput,
        lang: lang, // ✅ 临时写死为中文，如果你未来想支持英文再改
        model_name: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free' // ✅ 模型名称
      })
    });

    const data = await res.json();

    setParsedInfo(JSON.stringify(data.parsed, null, 2));
    setCypherQuery(data.cypher);
    setGraphResults(Array.isArray(data.graphResults) ? data.graphResults : []);
    setFinalRecommendation(data.finalText);
    setTranslatedInput(data.translatedInput || "");
    setUsedEntities(Array.isArray(data.usedEntities) ? data.usedEntities : []);

  };


  return (
    <div className="h-screen overflow-hidden bg-white pb-20">
      <div className="h-full overflow-y-auto p-6 space-y-6">
        {/* 用户输入推荐意图 */}
        <div>
          <label className="font-semibold">{t("rec.input_label")}</label>
          {/* 语言选择器 */}
          <div className="mt-3 flex items-center">
            <label className="font-semibold mr-2">语言选择 / Language:</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <textarea
            className="mt-2 w-full border border-gray-400 rounded p-2"
            rows={3}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={t("rec.input_placeholder")}
          />

          {/* Prompt 输入框 */}
          <div className="mt-4">
            <label className="font-semibold text-blue-700">{t("rec.prompt_label")}</label>
            <textarea
              className="mt-2 w-full border border-blue-300 rounded p-2 bg-blue-50"
              rows={2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={t("rec.prompt_placeholder")}
            />
          </div>
          

          <button
            onClick={handleGenerate}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t("rec.generate_button")}
          </button>
        </div>

        {translatedInput && (
          <div className="mt-4 border border-blue-300 bg-blue-50 p-3 rounded">
            <strong>{t("rec.translation_result")}</strong> {translatedInput}
          </div>
        )}

        {/* 结构化信息提取结果 */}
        <div>
          <h3 className="font-semibold">{t("rec.parsed_result_title")}</h3>
          <div className="max-h-[400px] overflow-y-auto bg-gray-100 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap">
            {parsedInfo || t("rec.parsed_waiting")}
          </div>
        </div>

        {/* Cypher 查询语句展示 */}
        <div>
          <h3 className="font-semibold">{t("rec.cypher_title")}</h3>
          <textarea
            className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
            rows={2}
            readOnly
            value={cypherQuery}
          />
        </div>

        {/* 查询结果展示 */}
        {/* 查询结果展示（可折叠） */}
        {/* 模块 A：候选实体（默认展示前10条） */}
        <div>
          <h3 className="font-semibold mb-2">{t("rec.graph_results_candidates")}</h3>
          {graphResults.length === 0 ? (
            <div className="text-sm text-gray-500"> {t("rec.graph_waiting")} </div>
          ) : (
            <div className="space-y-2">
              {graphResults.slice(0, 3).map((item, idx) => (
                <pre
                  key={idx}
                  className="border rounded px-3 py-2 text-sm text-gray-800 bg-gray-50 whitespace-pre-wrap"
                >
                  {item}
                </pre>
              ))}

              {graphResults.length > 3 && (
                <details className="border border-gray-300 rounded mt-2">
                  <summary className="cursor-pointer px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm text-blue-700">
                    🔽 {t("rec.show_more_results", { count: graphResults.length - 3 })}
                  </summary>
                  <div className="p-3 space-y-2">
                    {graphResults.slice(3).map((item, idx) => (
                      <pre
                        key={idx + 3}
                        className="border rounded px-3 py-2 text-sm text-gray-700 bg-white whitespace-pre-wrap"
                      >
                        {item}
                      </pre>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* 模块 B：实际使用的实体 */}
        {usedEntities && usedEntities.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">{t("rec.graph_results_used")}</h3>
            <div className="space-y-2">
              {/* 显示前 5 条 */}
              {usedEntities.slice(0, 5).map((ent, idx) => (
                <pre
                  key={idx}
                  className="border rounded px-3 py-2 text-sm text-gray-800 bg-gray-50 whitespace-pre-wrap"
                >
                  {JSON.stringify(ent, null, 2)}
                </pre>
              ))}

              {/* 折叠显示剩余的 */}
              {usedEntities.length > 5 && (
                <details className="border border-gray-300 rounded mt-2">
                  <summary className="cursor-pointer px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm text-blue-700">
                    🔽 {t("rec.show_more_results", { count: usedEntities.length - 5 })}
                  </summary>
                  <div className="p-3 space-y-2">
                    {usedEntities.slice(5).map((ent, idx) => (
                      <pre
                        key={idx + 5}
                        className="border rounded px-3 py-2 text-sm text-gray-700 bg-white whitespace-pre-wrap"
                      >
                        {JSON.stringify(ent, null, 2)}
                      </pre>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}




        {/* 最终推荐语句 */}
        <div>
          <h3 className="font-semibold">{t("rec.final_title")}</h3>
          <div className="border border-gray-300 rounded p-3 text-gray-800">
            {finalRecommendation || t("rec.final_empty")}
          </div>
        </div>
      </div>
    </div>
  );
}
