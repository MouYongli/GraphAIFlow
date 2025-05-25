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

  useEffect(() => {
    fetch("http://localhost:8000/api/chat/summary")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSummaries(data);
        else setSummaries([]);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/chat/survey_list")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSurveyList(data);
        else setSurveyList([]);
      });
  }, []);

  const mergedData = summaries.map((summary) => {
    const sus = surveyList.find((s) => s.chat_id === summary.chat_id);
    return {
      ...summary,
      sus_score: sus?.sus_score ?? "-",
    };
  });

  const handleDelete = async (chatId: string) => {
    const confirmed = window.confirm(`确定删除记录 ${chatId} 吗？（不会删除聊天内容）`);
    if (!confirmed) return;

    // 前端立即删除以刷新 UI
    setSummaries((prev) => prev.filter((s) => s.chat_id !== chatId));
    setSurveyList((prev) => prev.filter((s) => s.chat_id !== chatId));

    // 后台异步删除
    try {
      await fetch(`http://localhost:8000/api/chat/survey/${chatId}`, { method: "DELETE" });
      await fetch(`http://localhost:8000/api/chat/rating_delete/${chatId}`, { method: "DELETE" });
    } catch (err) {
      console.warn("⚠️ 后端删除失败", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chat 综合评分记录</h1>
      <table className="min-w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Chat ID</th>
            <th className="border p-2">评分数</th>
            <th className="border p-2">平均分</th>
            <th className="border p-2">SUS 分数</th>
            <th className="border p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {mergedData.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-2">暂无记录</td>
            </tr>
          ) : (
            mergedData.map((item) => (
              <tr key={item.chat_id}>
                <td
                  className="border p-2 text-blue-600 cursor-pointer hover:underline"
                  onClick={() => router.push(`/survey/${item.chat_id}`)}
                >
                  {item.chat_id}
                </td>
                <td className="border p-2 text-center">{item.score_count}</td>
                <td className="border p-2 text-center">{item.average_score}</td>
                <td className="border p-2 text-center">{item.sus_score}</td>
                <td className="border p-2 text-center">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(item.chat_id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudioPage;
