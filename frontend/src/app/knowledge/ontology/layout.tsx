
export default function OntologyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* 主内容区 */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
