"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Chat", href: "/chat" },
    { name: "Knowledge", href: "/knowledge" },
    { name: "Studio", href: "/studio" },
  ];

  return (
    <nav className="flex space-x-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`text-lg hover:text-gray-300 ${
              isActive ? "underline" : ""
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
