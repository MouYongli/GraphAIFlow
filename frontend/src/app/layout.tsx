import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/common/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Next.js 13 App",
  description: "An example project with Tailwind, Headless UI, etc.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {/* 全局头部 (如导航、Logo等) */}
        <Header />

        {/* 页面内容 */}
        {children}
      </body>
    </html>
  );
}
