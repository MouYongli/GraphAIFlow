"use client";

import { useRef, useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

interface Node {
  id: string;
  label: string;
  type: string;
  x?: number;
  y?: number;
}

interface Link {
  source: string | Node;
  target: string | Node;
  label: string;
}

interface GraphData {
  nodes: Node[];
  edges: Link[];
}

interface OntologyGraphProps {
  ontologyData: GraphData;
}

export default function OntologyGraph({ ontologyData }: OntologyGraphProps) {
  const graphRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);

  // 监听窗口大小变化
  useEffect(() => {
    const updateSize = () => {
      if (graphRef.current) {
        const { offsetWidth, offsetHeight } = graphRef.current;
        setWidth(offsetWidth || 800);
        setHeight(offsetHeight || 600);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 获取节点颜色
  const getNodeColor = (node: Node): string => {
    if (node.type === "class") return "#89CFF0"; // 浅蓝色
    if (node.type === "external_class") return "#4169E1"; // 深蓝色
    if (node.type === "property") return "#4CAF50"; // 绿色
    if (node.type === "data_type") return "#FFD700"; // 黄色
    return "#D3D3D3"; // 默认灰色
  };

  // 获取边的样式（子类关系用虚线）
  const getLinkStyle = (link: Link): number[] | null => {
    return link.label === "Subclass of" ? [5, 5] : null;
  };

  return (
    <div ref={graphRef} className="h-[600px] bg-white shadow-lg rounded-lg p-4">
      <ForceGraph2D
        width={width}
        height={height}
        graphData={{ nodes: ontologyData.nodes, links: ontologyData.edges }}
        
        // ✅ 调整力导向布局参数
        d3Force="charge"
        d3AlphaDecay={0.05} // 降低收敛速度，让图谱展开
        d3VelocityDecay={0.2} // 增加节点之间的排斥力
        nodeRelSize={8} // 节点大小
        linkDistance={120} // ✅ 增加边的长度，让图谱更分散
        linkStrength={0.5} // 边的弹性系数
        cooldownTicks={100} // 增加冷却时间，让图谱慢慢展开
        
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = getNodeColor(node);
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "black";
          ctx.fillText(label, node.x, node.y - 12);
        }}
        linkCanvasObjectMode={() => "after"}
        linkCanvasObject={(link: any, ctx) => {
          const fontSize = 10;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = "black";
          const midX = (link.source.x + link.target.x) / 2;
          const midY = (link.source.y + link.target.y) / 2;
          ctx.fillText(link.label, midX, midY);
        }}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkLineDash={(link: any) => getLinkStyle(link)}
        linkWidth={1}
      />
    </div>
  );
}
