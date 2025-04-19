import React from "react";

// 定义 OntologyNode 类型
export interface OntologyNode {
  id: string;
  name: string;
  type: "Ontology" | "Class" | "DataProperty" | "ObjectProperty";
  children?: OntologyNode[];
}

// ✅ 允许 `depth, x, y` 用于布局计算
export interface ExtendedOntologyNode extends OntologyNode {
  depth?: number;
  x?: number;
  y?: number;
}

// **OntologyTree 组件**
const OntologyTree: React.FC<{ data: OntologyNode[] }> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-gray-500">⚠️ 没有解析到本体层级结构</p>;
  }

  return (
    <ul>
      {data.map((node, index) => (
        <li key={`${node.id}-${node.type}-${index}`} style={{ fontWeight: node.children?.length ? "bold" : "normal" }}>
          {node.name} ({node.type || "Unknown"})
          {node.children?.length ? <OntologyTree data={node.children} /> : null}
        </li>
      ))}
    </ul>
  );
};

export default OntologyTree;