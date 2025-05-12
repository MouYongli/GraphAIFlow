"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ChatSummary {
  chat_id: string;
  score_count: number;
  average_score: number;
}

interface SurveyRecord {
  chat_id: string;
  sus_score: number;
}

const StudioPage = () => {
  const [summaries, setSummaries] = useState<ChatSummary[]>([]);
  const [surveyList, setSurveyList] = useState<SurveyRecord[]>([]);
  const router = useRouter();

  // 获取 chat summary
  useEffect(() => {
    fetch("http://localhost:8000/api/chat/summary")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSummaries(data);
        } else {
          console.error("❌ chat summary 返回的不是数组：", data);
          setSummaries([]);
        }
      });
  }, []);

  // 获取 SUS 问卷记录
  useEffect(() => {
    fetch("http://localhost:8000/api/chat/survey_list")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSurveyList(data);
        } else {
          console.error("❌ survey_list 返回的不是数组：", data);
          setSurveyList([]);
        }
      });
  }, []);

  // 合并两个数据
  const mergedData = summaries.map((summary) => {
    const susRecord = surveyList.find((s) => s.chat_id === summary.chat_id);
    return {
      ...summary,
      sus_score: susRecord?.sus_score ?? "-", // 没有记录时显示 -
    };
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chat Comprehensive scoring records</h1>
      <table className="min-w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Chat ID</th>
            <th className="border p-2">score_count</th>
            <th className="border p-2">avg</th>
            <th className="border p-2">SUS Score</th>
          </tr>
        </thead>
        <tbody>
          {mergedData.length === 0 ? (
            <tr><td colSpan={4} className="text-center p-2">暂无记录</td></tr>
          ) : (
            mergedData.map((item) => (
              <tr key={item.chat_id}>
                <td
                  className="border p-2 text-blue-600 cursor-pointer hover:underline"
                  onClick={() => router.push(`/survey/${item.chat_id}`)}
                >
                  {item.chat_id}
                </td>
                <td className="border p-2">{item.score_count}</td>
                <td className="border p-2">{item.average_score}</td>
                <td className="border p-2">{item.sus_score}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudioPage;
