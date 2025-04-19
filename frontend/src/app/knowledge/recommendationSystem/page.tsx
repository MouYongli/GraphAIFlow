'use client';

import React, { useState } from 'react';

export default function RecommendationPage() {
  const [userInput, setUserInput] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [parsedInfo, setParsedInfo] = useState('');
  const [cypherQuery, setCypherQuery] = useState('');
  const [graphResults, setGraphResults] = useState<string[]>([]);
  const [finalRecommendation, setFinalRecommendation] = useState('');

  const handleGenerate = async () => {
    const res = await fetch('http://localhost:8000/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: userInput,
        prompt: promptInput
      })
    });

    const data = await res.json();

    setParsedInfo(JSON.stringify(data.parsed, null, 2));
    setCypherQuery(data.cypher);
    setGraphResults(data.graphResults);
    setFinalRecommendation(data.finalText);
  };

  return (
    <div className="h-screen overflow-hidden bg-white pb-20">
      <div className="h-full overflow-y-auto p-6 space-y-6">
        {/* 用户输入推荐意图 */}
        <div>
          <label className="font-semibold">请输入推荐需求：</label>
          <textarea
            className="mt-2 w-full border border-gray-400 rounded p-2"
            rows={3}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="例如：我想在春天去北京赏花和吃美食"
          />

          {/* Prompt 输入框 */}
          <div className="mt-4">
            <label className="font-semibold text-blue-700">Prompt 指令（引导LLM行为）</label>
            <textarea
              className="mt-2 w-full border border-blue-300 rounded p-2 bg-blue-50"
              rows={2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="例如：请提取地点、时间、活动、餐厅，并生成结构化JSON"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            生成推荐
          </button>
        </div>

        {/* 结构化信息提取结果 */}
        <div>
          <h3 className="font-semibold">结构化信息提取结果</h3>
          <div className="max-h-[400px] overflow-y-auto bg-gray-100 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap">
            {parsedInfo || '等待生成...'}
          </div>
        </div>

        {/* Cypher 查询语句展示 */}
        <div>
          <h3 className="font-semibold">生成的 Cypher 查询语句</h3>
          <textarea
            className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
            rows={2}
            readOnly
            value={cypherQuery}
          />
        </div>

        {/* 查询结果展示 */}
        <div>
          <h3 className="font-semibold">图谱查询结果（候选项）</h3>
          <ul className="list-disc pl-6 text-sm text-gray-700">
            {graphResults.length > 0 ? graphResults.map((item, idx) => (
              <li key={idx}>{item}</li>
            )) : <li>等待查询结果...</li>}
          </ul>
        </div>

        {/* 最终推荐语句 */}
        <div>
          <h3 className="font-semibold">最终推荐输出（自然语言）</h3>
          <div className="border border-gray-300 rounded p-3 text-gray-800">
            {finalRecommendation || '暂无推荐结果'}
          </div>
        </div>
      </div>
    </div>
  );
}
