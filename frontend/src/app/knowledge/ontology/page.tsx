import OntologyGraph from "@/components/knowledge/ontology/OntologyGraph";
import OntologyEditor from "@/components/knowledge/ontology/OntologyEditor";

export default function OntologyPage() {
  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* 左侧：知识图谱 */}
      <div className="col-span-2 bg-gray-100 p-4 rounded-lg h-[600px]">
        <h2 className="text-xl font-bold mb-4">Ontology 知识图谱</h2>
        <OntologyGraph />
      </div>

      {/* 右侧：编辑面板 */}
      <div className="bg-white shadow-lg p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">编辑 Ontology</h2>
        <OntologyEditor />
      </div>
    </div>
  );
}

