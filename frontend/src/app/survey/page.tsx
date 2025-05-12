"use client";

import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function SurveyPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat_id");

  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(10).fill(0));

  const handleChange = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  const handleSubmit = async () => {
    await fetch("http://localhost:8000/api/chat/survey_result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        detail_scores: scores, // ✅ 只传这两个字段
      }),
    });

    setSubmitted(true);
  };



  const questions = t("SUS_QUESTIONS", { returnObjects: true }) as string[];

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">{t("SUS_TITLE")}</h1>
      <p className="mb-2 text-gray-600">{t("SUS_CHAT_ID")}：{chatId}</p>
      <p className="mb-6 text-gray-700">{t("SUS_INTRO")}</p>

      {submitted ? (
        <p className="text-green-600 text-lg font-medium">{t("SUS_THANKS")}</p>
      ) : (
        <>
          {questions.map((q, i) => (
            <div key={i} className="mb-4">
              <p className="mb-2 font-medium">
                {t("SUS_QUESTION_PREFIX")}{i + 1}. {q}
              </p>
              <select
                className="border rounded p-2 w-full"
                value={scores[i]}
                onChange={(e) => handleChange(i, Number(e.target.value))}
              >
                <option value={0}>{t("SUS_SELECT_PLACEHOLDER") || "请选择..."}</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t("SUS_SUBMIT")}
          </button>
        </>
      )}
    </div>
  );
}
