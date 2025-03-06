"use client";
import { useTranslation } from "react-i18next";
import FeatureCard from "@/components/home/FeatureCard";
import Button from "@/components/common/Button";

export default function HomePage() {
  const { t } = useTranslation("common"); //  让 UI 自动更新

  return (
    <main className="p-8">
      {/* 头部区域 */}
      <section className="flex flex-col items-center justify-center py-24 ">
        <h1 className="text-center text-7xl font-extrabold leading-tight">
          {t("Welcome to TouRec")}
        </h1>
        <div className="my-6 px-20 text-center text-2xl text-text-secondary">
          {t(
            "Your Intelligent Tourism Information Searching Helper"
          )}
        </div>
        <div className="mt-4 flex flex-row gap-4">
          <a
            href="/chat"
            target="_blank"
          >
            <Button rounded size="large" variant="secondary">
              {t("Chat With Me")}
            </Button>
          </a>
        </div>
      </section>

      {/* 主要功能 */}
      <section className="bg-background-secondary py-20 max-lg:py-10">
        <FeatureCard title={t("景点关系")} description={t("探索不同景点的关联")} />
        <FeatureCard title={t("智能推荐")} description={t("推荐最佳旅游时间")} />
        <FeatureCard title={t("用户反馈")} description={t("查看真实评论")} />
      </section>
    </main>
  );
}
