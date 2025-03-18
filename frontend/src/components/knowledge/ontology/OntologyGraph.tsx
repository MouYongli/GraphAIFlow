import { useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import * as d3 from "d3";
import { OntologyNode } from "./OntologyTree";
import { ExtendedOntologyNode } from "./OntologyTree"; 


interface OntologyLink {
  source: string;
  target: string;
  label?: string;
  type: "ObjectProperty" | "subClassOf" | "DataProperty";
}

interface OntologyGraphProps {
  ontologyData: {
    nodes: OntologyNode[];
    links: OntologyLink[];
  };
}

// ✅ 设置不同类型的关系颜色
const linkColor = (link: OntologyLink) => {
  if (link.type === "subClassOf") return "blue";  // ✅ 继承关系
  if (link.type === "ObjectProperty") return "green";  // ✅ ObjectProperty 关系
  return "gray";  // 其他关系
};

export default function OntologyGraph({ ontologyData }: OntologyGraphProps) {
  const graphRef = useRef<any>(null);

  // ✅ 自动补充 "Thing" 根节点
  useEffect(() => {
    if (ontologyData.links.some(link => link.target === "Thing") && !ontologyData.nodes.find(n => n.id === "Thing")) {
      ontologyData.nodes.push({ id: "Thing", name: "Thing", type: "Class" });
    }
  }, [ontologyData]);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force("charge", d3.forceManyBody().strength(-500));
      graphRef.current.d3Force("link", d3.forceLink().distance(200).strength(1));
    }
  }, [ontologyData]);

  const nodeColor = (node: ExtendedOntologyNode) => {
    if (node.depth === 0) return "#003f5c"; // 根节点（深蓝）
    if (node.depth === 1) return "#2f4b7c"; // 一级节点（蓝）
    if (node.depth === 2) return "#665191"; // 二级节点（紫）
    if (node.depth === 3) return "#a05195"; // 三级节点（深粉）
    if (node.depth === 4) return "#d45087"; // 四级节点（红）
    return "#f95d6a"; // 五级以上（橙红）
  };

  return (
    <ForceGraph2D
      graphData={ontologyData}
      nodeColor={nodeColor} // ✅ 让颜色和层次对应
      linkColor={linkColor} // ✅ 保持链接颜色
      nodeAutoColorBy="type"
      width={800}
      height={600}
      enableNodeDrag={true}
      d3VelocityDecay={0.3}
    />
  );
}