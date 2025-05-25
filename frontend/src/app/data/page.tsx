"use client";
import { useEffect, useState } from "react";

interface Summary {
  chat_id: string;
  score_count: number;
  average_score: number;
}

interface SurveyDetail {
  chat_id: string;
  sus_score: number;
  detail_scores: number[];
  suggestion: string;
}

interface MergedRecord {
  chat_id: string;
  score_count: number;
  average_score: number;
  sus_score: number;
  detail_scores: number[];
  suggestion: string;
}

export default function SurveyExportPage() {
  const [data, setData] = useState<MergedRecord[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [summaryRes, surveyRes] = await Promise.all([
        fetch("http://localhost:8000/api/chat/summary").then((r) => r.json()),
        fetch("http://localhost:8000/api/chat/survey_detail_list").then((r) => r.json()),
      ]);

      // 合并数据
      const merged: MergedRecord[] = summaryRes.map((summary: Summary) => {
      const detail = surveyRes.find((d: SurveyDetail) =>
        d.chat_id.startsWith(summary.chat_id)
      );

      return {
        chat_id: summary.chat_id,
        score_count: summary.score_count,
        average_score: summary.average_score,
        sus_score: detail?.sus_score ?? -1,
        detail_scores:
          detail?.detail_scores?.length === 16
            ? detail.detail_scores
            : Array(16).fill("-"),
        suggestion: detail?.suggestion ?? "",
      };
    });


      setData(merged);
    };

    fetchAll();
  }, []);

  const handleExport = () => {
    const header = [
      "Chat ID",
      "Score Count",
      "Average Score",
      "SUS Score",
      ...Array.from({ length: 16 }, (_, i) => `Q${i + 1}`),
      "Suggestion"
    ];

    const rows = data.map((item) => [
      item.chat_id,
      item.score_count,
      item.average_score,
      item.sus_score,
      ...item.detail_scores,
      item.suggestion?.replace(/\n/g, " ")
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell)}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "survey_export.csv";
    link.click();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">综合评价导出</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={handleExport}
      >
        导出为 CSV
      </button>

      <table className="table-auto border border-collapse text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">Chat ID</th>
            <th className="border px-2 py-1">评分数</th>
            <th className="border px-2 py-1">平均分</th>
            <th className="border px-2 py-1">SUS 综合</th>
            {Array.from({ length: 16 }, (_, i) => (
              <th key={i} className="border px-2 py-1">{`Q${i + 1}`}</th>
            ))}
            <th className="border px-2 py-1">建议</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.chat_id}>
              <td className="border px-2 py-1">{item.chat_id}</td>
              <td className="border px-2 py-1 text-center">{item.score_count}</td>
              <td className="border px-2 py-1 text-center">{item.average_score}</td>
              <td className="border px-2 py-1 text-center">{item.sus_score}</td>
              {item.detail_scores.map((score, i) => (
                <td key={i} className="border px-2 py-1 text-center">{score}</td>
              ))}
              <td className="border px-2 py-1">{item.suggestion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
