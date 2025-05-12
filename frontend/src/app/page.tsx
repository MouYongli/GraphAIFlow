"use client";
import { useTranslation } from "react-i18next";
import FeatureCard from "@/components/home/FeatureCard";
import Button from "@/components/common/Button";

export default function HomePage() {
  const { t } = useTranslation("common");

  return (
    <main className="p-8">
      {/* 头部区域 */}
      <section className="flex flex-col items-center justify-center py-24 ">
        <h1 className="text-center text-7xl font-extrabold leading-tight">
          {t("home.welcome")}
        </h1>
        <div className="my-6 px-20 text-center text-2xl text-text-secondary">
          {t("home.slogan")}
        </div>
        <div className="mt-4 flex flex-row gap-4">
          <a href="/chat" target="_blank">
            <Button rounded size="large" variant="secondary">
              {t("home.chat_button")}
            </Button>
          </a>
        </div>
      </section>

      {/* 主要功能 */}
      <section className="bg-background-secondary py-20 max-lg:py-10">
        <FeatureCard
          title={t("home.section_1")}
          description={t("home.section_1_desc")}
        />
        <FeatureCard
          title={t("home.section_2")}
          description={t("home.section_2_desc")}
        />
        <FeatureCard
          title={t("home.section_3")}
          description={t("home.section_3_desc")}
        />
      </section>
    </main>
  );
}
