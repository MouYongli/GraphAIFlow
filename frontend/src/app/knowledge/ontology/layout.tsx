import { Sidebar } from "@/components/knowledge/ontology/Sidebar";

export default function OntologyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar 导航 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
