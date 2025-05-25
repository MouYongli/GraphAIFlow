"use client";

import { useEffect, useState } from "react";

type ModelConfig = {
  displayName: string;
  modelName: string;
  endpoint: string;
};

export default function SettingPage() {
  const [modelList, setModelList] = useState<ModelConfig[]>([]);
  const [selectedModelName, setSelectedModelName] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("Hello, who are you?");

  const selectedModel = modelList.find(
    (m) => m.displayName === selectedModelName
  );

  // 加载后端模型列表
  useEffect(() => {
    fetch("http://localhost:8000/api/models")
      .then((res) => res.json())
      .then((data) => {
        setModelList(data);
        if (data.length > 0) {
          setSelectedModelName(data[0].displayName);
        }
      })
      .catch((err) => {
        console.error("Failed to load models:", err);
      });
  }, []);

  const handleTestModel = async () => {
    if (!selectedModel) return;

    setTestResult("Testing...");

    try {
      const res = await fetch(selectedModel.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel.modelName,
          prompt: prompt,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const content =
          data?.response || data?.choices?.[0]?.message?.content || JSON.stringify(data);
        setTestResult("✅ " + content);
      } else {
        setTestResult(`❌ Failed: ${data?.error?.message || res.statusText}`);
      }
    } catch (error) {
      setTestResult("❌ Error: " + (error as any).message);
    }
  };

  return (
    <div className="flex justify-center p-8">
      <div className="w-full max-w-xl space-y-10">
        <h1 className="text-3xl font-bold text-center">⚙️ Model Settings</h1>

        {/* 测试模型 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">🧪 Test Model</h2>

          <select
            className="border px-4 py-2 rounded w-full mb-2"
            value={selectedModelName}
            onChange={(e) => setSelectedModelName(e.target.value)}
          >
            {modelList.map((model) => (
              <option key={model.displayName} value={model.displayName}>
                {model.displayName}
              </option>
            ))}
          </select>

          <p className="text-sm text-gray-600 mb-2">
            <strong>Model:</strong>{" "}
            <span className="font-mono">{selectedModel?.modelName}</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Endpoint:</strong>{" "}
            <span className="font-mono text-blue-700">{selectedModel?.endpoint}</span>
          </p>

          <textarea
            className="border px-3 py-2 rounded w-full h-28 mb-4"
            placeholder="Enter prompt to test..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            onClick={handleTestModel}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Test Model
          </button>

          {testResult && (
            <pre
              className={`mt-4 whitespace-pre-wrap text-sm border rounded p-4 ${
                testResult.startsWith("✅")
                  ? "text-green-800 border-green-200 bg-green-50"
                  : "text-red-800 border-red-200 bg-red-50"
              }`}
            >
              {testResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
