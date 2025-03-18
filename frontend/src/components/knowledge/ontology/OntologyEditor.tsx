import OntologyTree from "./OntologyTree";
import { OntologyNode } from "./OntologyTree";
import { useState } from "react";

//  只保留一个 Interface
interface OntologyEditorProps {
  ontologyData?: {  // 允许 `ontologyData` 为空，防止 TypeError
    classes: OntologyNode[];
    object_properties: { name: string }[];
    data_properties: OntologyNode[];
  };
}





export default function OntologyEditor({ ontologyData }: OntologyEditorProps) {
  if (!ontologyData) {
    console.error("❌ `ontologyData` 为空，检查数据传递！");
    return <p className="text-red-500">⚠️ 加载本体数据失败</p>;
  }
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  //  切换展开状态
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId); // 折叠
      } else {
        newExpanded.add(nodeId); // 展开
      }
      return newExpanded;
    });
  };

  //  递归渲染 Class 结构，支持折叠/展开
  const renderClassHierarchy = (nodes: OntologyNode[], depth = 0) => {
    return (
      <ul className="ml-2">
        {nodes.map((cls, index) => (
          <li key={index} className="mt-1">
            {/*  统一风格的展开/折叠按钮（ / ▼）*/}
            <button
              onClick={() => toggleNode(cls.id)}
              className="focus:outline-none flex items-center hover:bg-gray-100 px-1 rounded"
            >
              <span className="mr-1 text-black">
                {cls.children && cls.children.length > 0
                  ? expandedNodes.has(cls.id)
                    ? "▾" // 展开时显示下箭头
                    : "▸" // 关闭时显示右箭头
                  : "•"} {/* 没有子类的项用 "•" 占位 */}
              </span>
              <span className={depth === 0 ? "font-bold" : ""}>{cls.name}</span> (Class)
            </button>

            {/*  递归渲染子类 */}
            {expandedNodes.has(cls.id) && cls.children && cls.children.length > 0 && (
              <div className="ml-4">{renderClassHierarchy(cls.children, depth + 1)}</div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ontology 结构</h2>

      {/* Classes */}
      <div>
        <h3 className="text-lg font-semibold mt-4">Classes</h3>
        {ontologyData.classes.length > 0 ? (
          renderClassHierarchy(ontologyData.classes) //  递归渲染层级
        ) : (
          <p className="text-gray-500">⚠️ 没有解析到 Classes</p>
        )}
      </div>

      {/* Object Properties */}
      <div>
        <h3 className="text-lg font-semibold mt-4">Object Properties</h3>
        {ontologyData.object_properties.length > 0 ? (
          <ul>
            {ontologyData.object_properties.map((prop, index) => (
              <li key={index}>{prop.name} (ObjectProperty)</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">⚠️ 没有解析到 Object Properties</p>
        )}
      </div>

      {/* Data Properties */}
      <div>
        <h3 className="text-lg font-semibold mt-4">Data Properties</h3>
        {ontologyData.data_properties.length > 0 ? (
          <ul>
            {Array.from(ontologyData.data_properties).map((prop, index) => (
              <li key={index}>{String(prop)} (DataProperty)</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">⚠️ 没有解析到 Data Properties</p>
        )}
      </div>
    </div>
  );
}