"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function Nav() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();

  const navItems = React.useMemo(() => [
    { name: "Home", href: "/", key: "home" },
    { name: "Chat", href: "/chat", key: "chat" },
    { name: "Knowledge", href: "/knowledge", key: "knowledge" },
    { name: "Studio", href: "/studio", key: "studio" },
    { name: "Setting", href: "/setting", key: "setting" }, 
    { name: "Setting", href: "/data", key: "data" }, //  新增 Setting
  ], []);

  const selectedKey = React.useMemo(() => {
    if (pathname?.startsWith("/chat")) return "Chat";
    if (pathname?.startsWith("/knowledge")) return "Knowledge";
    if (pathname?.startsWith("/studio")) return "Studio";
    if (pathname?.startsWith("/setting")) return "Setting"; //  新增判断
    return "Home";
  }, [pathname]);

  return (
    <nav className="flex space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`text-lg hover:text-gray-300 ${selectedKey === item.name ? "underline" : ""}`}
        >
          {i18n.isInitialized ? t(`nav.${item.key}`) : item.name}
        </Link>
      ))}
    </nav>
  );
}
