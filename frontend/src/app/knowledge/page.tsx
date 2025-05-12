"use client";

import { useTranslation, Trans } from "react-i18next";

export default function KnowledgeOverviewPage() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-gray-100 p-6 overflow-auto">
      <div className="grid grid-cols-2 gap-8 items-start bg-white rounded-lg shadow p-6">
        <div>
          <h1 className="text-3xl font-bold mb-6">{t("knowledge.overview_title")}</h1>

          <p className="text-lg text-gray-700 mb-8">
            <Trans i18nKey="knowledge.overview_intro" t={t} components={{ 1: <span className="font-semibold" />, 3: <span className="font-semibold" />, 5: <span className="font-semibold" /> }} />
          </p>

          {/* Visualization */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("knowledge.visualization_title")}</h2>
            <p className="text-gray-700 mb-2">{t("knowledge.visualization_intro")}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{t("knowledge.visualization_ontology")}</li>
              <li>{t("knowledge.visualization_hierarchy")}</li>
              <li>{t("knowledge.visualization_kg")}</li>
            </ul>
          </div>

          {/* Knowledge Graphs */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("knowledge.graphs_title")}</h2>
            <p className="text-gray-700 mb-2">{t("knowledge.graphs_intro")}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{t("knowledge.graphs_update")}</li>
              <li>{t("knowledge.graphs_construction")}</li>
              <li>{t("knowledge.graphs_processing")}</li>
            </ul>
          </div>

          {/* Recommendation System */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("knowledge.recommendation_title")}</h2>
            <p className="text-gray-700">
              <Trans i18nKey="knowledge.recommendation_intro" t={t} components={{ 1: <span className="font-semibold" /> }} />
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="flex justify-center">
          <img
            src="/images/1.png"
            alt="Knowledge Flow Diagram"
            className="rounded-lg shadow-lg w-3/4"
          />
        </div>
      </div>
    </div>
  );
}
