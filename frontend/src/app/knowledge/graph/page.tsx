// frontend/src/app/knowledge/graph/page.tsx
import UploadManager from "@/components/terminology/UploadManager";
import TerminologyTips from "@/components/terminology/TerminologyTips";

export default function TerminologyPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Terminology Acquisition</h1>
      <TerminologyTips />
      <UploadManager />
    </div>
  );
}
