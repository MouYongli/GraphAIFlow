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

//  设置不同类型的关系颜色
const linkColor = (link: OntologyLink) => {
  if (link.type === "subClassOf") return "#0000FF";  // 蓝色
  if (link.type === "ObjectProperty") return "#008000";  // 绿色
  return "#333333";  // 深灰，确保在白色背景可见
};


const nodeColor = (node: ExtendedOntologyNode) => {
  if (node.depth === undefined) return "#BCEE68"; //  避免 depth 为空
  if (node.depth === 0) return "#2f4b7c"; //  根节点（深蓝）
  if (node.depth === 1) return "#4682B4"; //  一级节点（蓝）
  if (node.depth === 2) return "#87CEFA"; //  二级节点（紫）
  if (node.depth === 3) return "#a05195"; //  三级节点（深粉）
  return "#f95d6a"; //  五级及以上（橙红）
};




export default function OntologyGraph({ ontologyData }: OntologyGraphProps) {
  if (!ontologyData || !ontologyData.nodes || !ontologyData.links) {
    console.error("⚠️ ontologyData 为空或格式不正确:", ontologyData);
    return null;
  }
  const graphRef = useRef<any>(null);
  const processedNodes = ontologyData.nodes.map((node: ExtendedOntologyNode, index: number) => ({
    ...node,
    x: node.x ?? Math.random() * 800,
    y: node.y ?? Math.random() * 600,
  }));

  const processedData = { nodes: processedNodes, links: ontologyData.links };
  
  useEffect(() => {
    if (graphRef.current) {
        graphRef.current.d3Force("link", d3.forceLink()
            .id((d: any) => d.id)
            .distance(200) // ✅ 让线条更长（默认 50，现在 200）
            .strength(0.8)
            .iterations(5));
    }
}, [ontologyData]);

  
  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={processedData}
      nodeColor={nodeColor}
      linkColor={linkColor}
      width={800}
      height={600}
      enableNodeDrag={true}
      d3VelocityDecay={0.3}

      nodeCanvasObject={(node, ctx, globalScale) => {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    
        const maxRadius = 25; 
        const minRadius = 10; 
        const padding = 5; 
    
        // ✅ 1️⃣ 限制字符长度，超长自动省略
        // 1️⃣ 定义字符串类型
        const truncateText = (text: string, maxLength = 12): string => {
          return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
        };

        // 2️⃣ 让 displayName 成为字符串
        const displayName: string = truncateText(node.name ?? "", 10);

        const textWidth = ctx.measureText(displayName).width; 
        const radius = Math.min(Math.max(textWidth / 2 + padding, minRadius), maxRadius);
    
        // **绘制圆圈**
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = nodeColor(node);
        ctx.fill();
        ctx.strokeStyle = "black"; 
        ctx.lineWidth = 2;
        ctx.stroke();
    
        // **绘制文字**
        ctx.fillStyle = "white"; 
        ctx.fillText(displayName, node.x ?? 0, node.y ?? 0);
    }}
    

      

      linkCanvasObject={(link: any, ctx, globalScale) => { 
        const sourceNode = processedNodes.find(n => n.id === (link.source.id || link.source));
        const targetNode = processedNodes.find(n => n.id === (link.target.id || link.target));
    
        if (!sourceNode || !targetNode) {
            console.warn("⚠️ 无法找到节点:", link);
            return;
        }
    
        // **调试 link.type**
        console.log("🟢 进入绘制逻辑: link.type =", `"${link.type}"`);
    
        // **设置线条样式**
        ctx.globalAlpha = 1; 
        ctx.lineWidth = 2;
        ctx.strokeStyle = linkColor(link);
    
        if (link.type === "subClassOf") {
            ctx.setLineDash([5, 5]); // ✅ 虚线
        } else {
            ctx.setLineDash([]); // ✅ 实线
        }
    
        // **绘制连线**
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();
        ctx.setLineDash([]); // 避免影响后续绘制
    
        // **只隐藏 "subClassOf"，显示其他所有关系名称**
        if (link.type !== "subClassOf") {  
            console.log("📝 绘制标签:", link.type);
    
            const labelText = link.type;  // **直接使用 link.type 作为标签**
            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2;
    
            
            // **设置字体**
            const fontSize = Math.max(8, 9 / globalScale);
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            // **计算文本宽度**
            const padding = 3; // ✅ 让白色框更紧凑
        
            ctx.font = `${fontSize}px Arial`;
            const textWidth = ctx.measureText(labelText).width;
            const textHeight = fontSize + padding;

            // **1️⃣ 先绘制背景框**
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)"; // ✅ 确保背景是白色
            ctx.fillRect(midX - textWidth / 2 - padding, midY - textHeight / 2, textWidth + padding * 2, textHeight);

            // **2️⃣ 然后设置黑色字体**
            ctx.fillStyle = "black"; // ✅ 让文字变成黑色
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // **3️⃣ 最后绘制文字**
            ctx.fillText(labelText, midX, midY);

        }
    }}
    
    
          
    />
  );
}
