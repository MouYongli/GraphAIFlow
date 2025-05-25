'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

interface SUSDetail {
  chat_id: string;
  sus_score: number;
  detail_scores?: number[];
  suggestion?: string; // ✅ 新增字段
}


export default function SurveyDetailPage() {
  const { chat_id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sus, setSus] = useState<SUSDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();
  const questions = t('SUS_QUESTIONS', { returnObjects: true }) as string[];

  useEffect(() => {
    if (!chat_id) return;

    const loadData = async () => {
      try {
        // ✅ 尝试从 localStorage 加载完整聊天记录
        const localHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
        const localChat = localHistory.find((c: any) => c.id === chat_id);

        if (localChat && Array.isArray(localChat.messages)) {
          setMessages(localChat.messages);
        } else {
          // ✅ fallback：调用后端接口（兼容之前的行为）
          const chatRes = await fetch(`http://localhost:8000/api/chat/load/${chat_id}`);
          const chatData = await chatRes.json();
          setMessages(chatData || []);
        }

        // SUS 分数正常加载
        const susRes = await fetch(`http://localhost:8000/api/chat/survey/${chat_id}`);
        const susData = await susRes.json();
        setSus(susData || null);
      } catch (error) {
        console.error("❌ 加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [chat_id]);


  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat 详情：{chat_id}</h1>

      <h2 className="text-xl font-semibold mb-2">对话记录</h2>
      <div className="bg-white border rounded p-4 mb-6">
        {messages.length === 0 ? (
          <p>暂无聊天记录</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`mb-2 ${msg.sender === 'user' ? 'text-blue-700' : 'text-green-700'}`}>
              <strong>{msg.sender === 'user' ? '用户' : '助手'}：</strong>
              {msg.text}
            </div>
          ))
        )}
      </div>

      <h2 className="text-xl font-semibold mb-2">SUS 问卷详情</h2>
      <div className="bg-white border rounded p-4">
        {sus ? (
          <>
            <p className="mb-2">
              <strong>综合评分：</strong> {sus.sus_score}
            </p>


            {sus.detail_scores && sus.detail_scores.length > 0 && (
              <div className="mt-4 space-y-3">
                {sus.detail_scores.map((score, index) => (
                  <div key={index}>
                    <p className="font-medium">{index + 1}. {questions[index] || "（未知题目）"}</p>
                    <p className="text-gray-700">评分：{score}</p>
                  </div>
                ))}
              </div>
            )}

            {sus.suggestion && (
              <div className="mt-6">
                <p className="font-medium">用户反馈意见：</p>
                <p className="text-gray-700 whitespace-pre-line">{sus.suggestion}</p>
              </div>
            )}

          </>
        ) : (
          <p>暂无 SUS 问卷记录</p>
        )}
      </div>
    </div>
  );
}
