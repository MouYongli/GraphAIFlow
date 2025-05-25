"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Suggestion {
  term: string;
  type: string;
  suggested_class: string;
  reasoning: string;
}

interface FlattenedSuggestion {
  term: string;
  type: string;
  suggested_class: string;
  reasoning: string;
}

interface Props {
  suggestions: Suggestion[];
  onAdd: (item: FlattenedSuggestion) => void;
  existingClasses: string[];
  existingProperties: string[];
}

export default function OntologySuggestionPanel({
  suggestions,
  onAdd,
  existingClasses,
  existingProperties,
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { t } = useTranslation("common");

  const safeParseJSON = (input: any): any => {
    let result = input;
    if (typeof result === "string") {
      result = result.trim().replace(/^```json|```$/g, "").trim();
    }
    try {
      while (typeof result === "string") {
        result = JSON.parse(result);
      }
    } catch {
      return null;
    }
    return result;
  };

  const isNewTerm = (term: string): boolean => {
    return !existingClasses.includes(term) && !existingProperties.includes(term);
  };

  const flattenSuggestions = (raw: Suggestion[]): FlattenedSuggestion[] => {
    const flat: FlattenedSuggestion[] = [];

    raw.forEach((sug) => {
      const parsed = safeParseJSON(sug.reasoning);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          const term = item.term || "未知";
          if (isNewTerm(term)) {
            flat.push({
              term,
              type: item.type || "Unknown",
              suggested_class: item.suggested_class || "",
              reasoning: item.reasoning || "无说明",
            });
          }
        });
      } else {
        if (isNewTerm(sug.term)) {
          flat.push({
            term: sug.term,
            type: sug.type,
            suggested_class: sug.suggested_class,
            reasoning: sug.reasoning,
          });
        }
      }
    });

    return flat;
  };

  const flattened = flattenSuggestions(suggestions);

  const toggleSelect = (index: number) => {
    const newSet = new Set(selected);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelected(newSet);
  };

  const handleAddSelected = async () => {
    if (selected.size === 0) {
      alert("请选择至少一个术语！");
      return;
    }

    const toAdd = Array.from(selected).map((i) => flattened[i]);

    for (const item of toAdd) {
      try {
        const res = await fetch("/api/add_class", {
          method: "POST",
          body: JSON.stringify({ term: item.term, type: "Class" }),
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          console.error(`❌ 加入失败: ${item.term}`);
        }
      } catch (e) {
        console.error("Error adding to ontology:", e);
      }
    }

    alert(`30 成功加入本体：${toAdd.map((t) => t.term).join(", ")}`);
    setSelected(new Set());
  };

  // ✨ 新增：展示 Error 类型的建议为大框
  if (
    suggestions.length === 1 &&
    suggestions[0].type === "Error"
  ) {
    const raw = suggestions[0].reasoning || "";
    const cleaned = raw
      .replace(/<think>[\s\S]*?<\/think>/g, "") // 删除 <think> 标签内容
      .replace(/\*{1,2}/g, "") // 删除 * 和 **
      .trim();

    return (
      <div className="border border-red-300 bg-red-50 rounded shadow-inner p-2">
        <div className="max-h-[500px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed p-4 text-gray-800 font-sans bg-white rounded">
          {cleaned}
        </div>
      </div>
    );

  }


  return (
    <div className="mt-6">
      {flattened.length === 0 ? (
        <p className="text-gray-500">{t("terminology.no_terms")}</p>
      ) : (
        <>
          <table className="w-full text-sm table-fixed border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-10 p-2 border text-center">30</th>
                <th className="w-24 p-2 border">术语</th>
                <th className="w-24 p-2 border">类型</th>
                <th className="w-32 p-2 border">推荐分类</th>
                <th className="p-2 border">推荐理由</th>
                <th className="w-24 p-2 border text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {flattened.map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50 align-top">
                  <td className="p-2 text-center border">
                    <input
                      type="checkbox"
                      checked={selected.has(idx)}
                      onChange={() => toggleSelect(idx)}
                    />
                  </td>
                  <td className="p-2 border">{item.term}</td>
                  <td className="p-2 border">{item.type}</td>
                  <td className="p-2 border text-blue-600">
                    {item.suggested_class || "（无）"}
                  </td>
                  <td className="p-2 border text-gray-700 align-top">
                    <div className="max-h-60 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed px-2 py-1 rounded bg-white shadow-inner">
                      {item.reasoning}
                    </div>
                  </td>
                  <td className="p-2 text-center border">
                    <button
                      onClick={() => onAdd(item)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                    >
                      加入本体
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

    
        </>
      )}
    </div>
  );
}
