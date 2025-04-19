"use client";

import { useState } from "react";
import FileUploadManager from "@/components/file/FileUploadManager";
import HierarchyTree from "@/components/knowledge/ontology/HierarchyTree";
import PromptTextBox from "@/components/knowledge/ontology/PromptTextBox";
import { OntologyNode } from "@/components/knowledge/ontology/OntologyTree";
import type { ObjectProperty, DataProperty } from "@/components/knowledge/ontology/OntologyEditor";

interface OntologyLink {
  source: string;
  target: string;
  label?: string;
  type: "subClassOf" | "ObjectProperty" | "DataProperty";
}

function prunePureSubclassNodes(
  nodes: OntologyNode[],
  links: OntologyLink[],
  objectProperties: ObjectProperty[],
  dataProperties: DataProperty[]
): OntologyNode[] {
  const objectRelated = new Set<string>();
  const dataRelated = new Set<string>();
  const subclassChildren = new Set<string>();
  const subclassParents = new Set<string>();

  objectProperties.forEach(op => {
    objectRelated.add(op.source);
    objectRelated.add(op.target);
  });

  dataProperties.forEach(dp => {
    dataRelated.add(dp.source);
  });

  links.forEach(link => {
    if (link.type === "subClassOf") {
      subclassChildren.add(link.target);
      subclassParents.add(link.source);
    }
  });

  return nodes.filter(node => {
    const isTop = node.id === "Thing";
    const hasObjectLink = objectRelated.has(node.id);
    const hasDataLink = dataRelated.has(node.id);
    const isParent = subclassChildren.has(node.id);
    const isChild = subclassParents.has(node.id);

    if (isTop || hasObjectLink || hasDataLink || isParent) return true;
    return !isChild;
  });
}

function buildClassHierarchy(nodes: OntologyNode[], links: OntologyLink[]): OntologyNode[] {
  const nodeMap = new Map<string, OntologyNode>();
  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  links.forEach(link => {
    if (link.type === "subClassOf") {
      const parent = nodeMap.get(link.target);
      const child = nodeMap.get(link.source);
      if (parent && child) parent.children?.push(child);
    }
  });

  const topLevelClasses = nodes.filter(
    node => !links.some(link => link.source === node.id && link.type === "subClassOf")
  );

  let thingNode = nodeMap.get("Thing");
  if (!thingNode) {
    thingNode = { id: "Thing", name: "Thing", type: "Class", children: [] };
    nodeMap.set("Thing", thingNode);
  }

  thingNode.children = topLevelClasses.filter(cls => cls.id !== "Thing");

  function attachChildren(node: OntologyNode) {
    node.children?.forEach(child => {
      child.children = links
        .filter(link => link.type === "subClassOf" && link.target === child.id)
        .map(link => nodeMap.get(link.source)!)
        .filter(Boolean);
      attachChildren(child);
    });
  }

  attachChildren(thingNode);
  return [thingNode];
}

export default function HierarchyPage() {
  const [filename, setFilename] = useState("");
  const [hierarchy, setHierarchy] = useState<OntologyNode[]>([]);
  const [promptText, setPromptText] = useState("");
  const [showPureSubclass, setShowPureSubclass] = useState(false); // ✅ 控制切换状态

  const handleParseFile = async (filename: string, forceShowAll = showPureSubclass) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/files/${filename}/parse`);
      if (!response.ok) throw new Error("解析失败");

      const data = await response.json();
      const graph = data.graph;

      const nodes = (graph.nodes || []).filter((n: any) => n.type === "Class");
      const links = graph.links || [];
      const objectProperties = graph.object_properties || [];
      const dataProperties = graph.data_properties || [];

      const usedNodes = forceShowAll
        ? nodes
        : prunePureSubclassNodes(nodes, links, objectProperties, dataProperties);

      const structured = buildClassHierarchy(usedNodes, links);

      setHierarchy(structured);
      setFilename(filename);

      const text = generatePromptText(structured, objectProperties);
      setPromptText(text);
    } catch (error) {
      console.error("❌ 解析失败:", error);
    }
  };

  const generatePromptText = (nodes: OntologyNode[], objectProperties: ObjectProperty[]) => {
    const lines: string[] = [];
  
    // ✅【结构参考】
    lines.push("【结构参考】");
    lines.push("以下是本体中的类层级结构（仅供参考）：");
  
    function traverse(node: OntologyNode, depth = 0) {
      lines.push(`${"  ".repeat(depth)}- ${node.name}`);
      node.children?.forEach(child => traverse(child, depth + 1));
    }
  
    nodes.forEach(root => traverse(root));
    lines.push("");
  
    // ✅【实体识别】
    lines.push("【实体识别】");
    lines.push("仅允许识别以下类别的实体，禁止创建任何新的类别：");
  
    const classNames = new Set<string>();
    objectProperties.forEach(op => {
      classNames.add(op.source);
      classNames.add(op.target);
    });
    classNames.forEach(name => lines.push(`- ${name}`));
  
    lines.push("");
  
    // ✅【关系提取】
    lines.push("【关系提取】");
    lines.push("仅允许识别以下关系，禁止创建未定义的关系：");
    objectProperties.forEach(op => {
      lines.push(`- ${op.name}: ${op.source} → ${op.target}`);
    });
  
    return lines.join("\n");
  };
  

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      alert("✅ 文本已复制到剪贴板！");
    } catch (err) {
      alert("❌ 复制失败！");
    }
  };

  const togglePureSubclassView = () => {
    setShowPureSubclass(prev => {
      const next = !prev;
      if (filename) {
        handleParseFile(filename, next);
      }
      return next;
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      <div className="col-span-2 flex flex-col gap-4 relative">
        <FileUploadManager
          onParseFile={(f) => handleParseFile(f, showPureSubclass)}
          onRefresh={() => {
            if (filename) handleParseFile(filename, showPureSubclass);
          }}
        />
        <div className="bg-gray-100 p-4 rounded-lg h-[600px] overflow-hidden shadow relative">
          <h2 className="text-xl font-bold mb-4">Ontology 层级结构</h2>
          <button
            onClick={togglePureSubclassView}
            className="absolute top-2 right-4 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
          >
            {showPureSubclass ? "隐藏纯子类" : "显示全部层级"}
          </button>
          <HierarchyTree data={hierarchy} />
        </div>
      </div>

      <div className="bg-white shadow-lg p-4 rounded-lg h-[700px] flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Prompt 文本输出</h2>
          <button
            onClick={handleCopy}
            className="bg-gray-200 hover:bg-gray-300 text-sm px-2 py-1 rounded"
          >
             复制
          </button>
        </div>
        <PromptTextBox content={promptText} />
      </div>
    </div>
  );
}
