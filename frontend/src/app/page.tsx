"use client";
import { useTranslation } from "react-i18next";
import Button from "@/components/common/Button";
import BeijingCarousel from "@/components/home/BeijingCarousel";

export default function HomePage() {
  const { t } = useTranslation("common");

  return (
    <main className="bg-[#F3F4F6] min-h-screen pb-20">
      {/* 欢迎区 */}
      <section className="flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-center text-6xl font-extrabold leading-tight text-gray-900">
          {t("home.welcome")}
        </h1>
        <p className="mt-6 text-center text-2xl text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
          {t("home.slogan")}
        </p>
        <a href="/chat" target="_blank" className="mt-6">
          <Button
            rounded
            size="large"
            className="bg-[#9A1F24] text-white hover:bg-[#80181c] transition"
          >
            {t("home.chat_button")}
          </Button>
        </a>
      </section>

      {/* 系统介绍区域：轮播图 + 文字 */}
      <section className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6 mb-14 flex flex-col md:flex-row items-center gap-8">
        {/* 左侧轮播图 */}
        <div className="w-full md:w-[42%] rounded-xl overflow-hidden">
          <BeijingCarousel />
        </div>

        {/* 右侧文字介绍 */}
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-bold text-[#9A1F24] mb-4">
            {t("home.why_title")}
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">
            {t("home.why_desc")}
          </p>
        </div>
      </section>

      {/* 系统亮点卡片 */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">
          {t("home.features_title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-gray-800"
            >
              <h3 className="text-xl font-semibold mb-2">
                {t(`home.section_${i}`)}
              </h3>
              <p className="text-gray-600">{t(`home.section_${i}_desc`)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
