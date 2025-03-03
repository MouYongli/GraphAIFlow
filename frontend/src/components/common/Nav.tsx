"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from 'react-i18next';

export default function Nav() {
  const pathname = usePathname();
    
  let selectedKey = 'Home';
  if (pathname.startsWith('/chat')) {
    selectedKey = 'Chat';
  } else if (pathname.startsWith('/knowledge')) {
    selectedKey = 'Knowledge';
  } else if (pathname.startsWith('/studio')) {
    selectedKey = 'Studio';
  } 

  const navItems = [
    { name: "Home", href: "/", key: "home" },
    { name: "Chat", href: "/chat", key: "chat" },
    { name: "Knowledge", href: "/knowledge", key: "knowledge" },
    { name: "Studio", href: "/studio", key: "studio" },
  ];

  const { t } = useTranslation();

  return (
    <nav className="flex space-x-6">
      {navItems.map((item) => {
        const isActive = selectedKey === item.name;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`text-lg hover:text-gray-300 ${
              isActive ? "underline" : ""
            }`}
          >
          {t(`nav.${item.key}`)}
          </Link>
        );
      })}
    </nav>
  );
}
