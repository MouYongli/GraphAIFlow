"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { OntologyNode } from "./OntologyTree";

// 动态加载 d3 tree
const Tree = dynamic(() => import("react-d3-tree").then(mod => mod.Tree), { ssr: false });

interface Props {
  data: OntologyNode[];
}

const HierarchyTree: React.FC<Props> = ({ data }) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [hideLeaves, setHideLeaves] = useState(false); // 控制是否隐藏最深层

  const containerRef = useRef(null);

  // 计算最大深度
  const getMaxDepth = (node: OntologyNode, currentDepth = 0): number => {
    if (!node.children || node.children.length === 0) return currentDepth;
    return Math.max(...node.children.map(child => getMaxDepth(child, currentDepth + 1)));
  };

  // 递归构建 treeData
  const convertNode = (node: OntologyNode, currentDepth = 0, maxDepth = 10): any => {
    const children =
      node.children
        ?.filter(child => !hideLeaves || getMaxDepth(child) < maxDepth) // 过滤叶子节点
        .map(child => convertNode(child, currentDepth + 1, maxDepth)) || [];

    return {
      name: node.name,
      attributes: { type: node.type },
      children: children.length > 0 ? children : undefined,
    };
  };

  useEffect(() => {
    if (data && data.length > 0) {
      const maxDepth = Math.max(...data.map(node => getMaxDepth(node)));
      const formatted = data.map(node => convertNode(node, 0, maxDepth));
      setTreeData(formatted);
    }
  }, [data, hideLeaves]);

  // 自定义节点样式
  const renderCustomNode = ({ nodeDatum }: any) => (
    <g>
      <rect
        width={140}
        height={50}
        x={-70}
        y={-25}
        fill={nodeDatum.name.startsWith("tao:") ? "#fef6d6" : "#cfe2f3"}
        stroke="#333"
        strokeWidth={1.2}
        rx={8}
      />
      <text fill="#000" x={0} y={5} textAnchor="middle" fontSize={13}>
        {nodeDatum.name}
      </text>
    </g>
  );

  return (
    <div className="w-full h-[600px] relative">
      

      <div ref={containerRef} className="w-full h-full">
        {treeData.length > 0 ? (
          <Tree
          data={treeData}
          orientation="vertical"
          translate={{ x: 400, y: 100 }}
          zoomable
          pathFunc="diagonal"   // ✅ 树状连接！
          nodeSize={{ x: 120, y: 150 }}
          separation={{ siblings:1.3, nonSiblings: 2 }}
          renderCustomNodeElement={renderCustomNode}
        />        
        ) : (
          <p className="text-gray-500">⚠️ 没有解析到本体层级结构</p>
        )}
      </div>
    </div>
  );
};

export default HierarchyTree;
