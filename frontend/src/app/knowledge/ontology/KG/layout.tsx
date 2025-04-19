export default function OntologyLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* 主内容区 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    );
  }
  