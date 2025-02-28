"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Disclosure, Menu } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 bg-gray-800 text-white flex flex-col`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-xl font-bold whitespace-nowrap">
            {sidebarOpen ? "Knowledge" : "K"}
          </span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? (
              <ChevronLeftIcon className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Sidebar menu */}
        <nav className="p-4 flex-1 overflow-y-auto space-y-2">
          {/* Ontology */}
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button
                  className="flex items-center justify-between w-full px-4 py-2
                             text-left text-sm font-medium bg-gray-900 rounded-lg
                             hover:bg-gray-700 focus:outline-none"
                >
                  <span>Ontology</span>
                  {open ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pt-2 pb-2 text-sm text-gray-300">
                  <ul>
                    <li className="py-1 hover:text-gray-100 cursor-pointer">
                      <Link href="/knowledge/ontology">
                        Ontology Sub-Item
                      </Link>
                    </li>
                  </ul>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>

          {/* Knowledge Graphs */}
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button
                  className="flex items-center justify-between w-full px-4 py-2
                             text-left text-sm font-medium bg-gray-900 rounded-lg
                             hover:bg-gray-700 focus:outline-none"
                >
                  <span>Knowledge Graphs</span>
                  {open ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pt-2 pb-2 text-sm text-gray-300">
                  <ul className="space-y-1">
                    <li className="hover:text-gray-100 cursor-pointer">
                      <Link href="/knowledge/graphs/a">Graph A</Link>
                    </li>
                    <li className="hover:text-gray-100 cursor-pointer">
                      <Link href="/knowledge/graphs/b">Graph B</Link>
                    </li>
                  </ul>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar (optional, can reuse global header or create a custom one) */}
        <header className="bg-gray-900 text-white px-6 py-2 flex items-center">
          {/* Mobile sidebar toggle button */}
          <button
            className="mr-4 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>

          {/* Title or Logo */}
          <div className="font-bold text-lg mr-6 hidden md:block">Knowledge</div>

          {/* (Optional) Additional nav or placeholders */}
          <nav className="hidden md:flex space-x-4">
            <Link
              href="/"
              className={`px-3 py-1 rounded hover:bg-gray-700 ${
                pathname === "/" ? "bg-gray-700" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/chat"
              className={`px-3 py-1 rounded hover:bg-gray-700 ${
                pathname === "/chat" ? "bg-gray-700" : ""
              }`}
            >
              Chat
            </Link>
          </nav>

          <div className="flex-1" />

          {/* Headless UI Menu as user dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 focus:outline-none">
              <span>User</span>
            </Menu.Button>
            <Menu.Items
              className="absolute right-0 mt-2 w-40 bg-white text-gray-800
                         rounded-md shadow-lg ring-1 ring-black ring-opacity-5
                         focus:outline-none z-10"
            >
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="#profile"
                      className={`block px-4 py-2 text-sm ${
                        active ? "bg-gray-100" : ""
                      }`}
                    >
                      Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="#signout"
                      className={`block px-4 py-2 text-sm ${
                        active ? "bg-gray-100" : ""
                      }`}
                    >
                      Sign Out
                    </Link>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 bg-white text-gray-900">{children}</main>
      </div>
    </div>
  );
}
