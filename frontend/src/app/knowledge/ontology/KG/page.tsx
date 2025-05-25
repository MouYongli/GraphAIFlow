'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import OverviewPanel from '@/components/knowledge/KG/OverviewPanel';

interface Node {
  id: string;
  name: string;
  label: string;
  color: string;
  x?: number;
  y?: number;
}
interface Link {
  source: string;
  target: string;
  label: string;
}
type GraphData = { nodes: Node[]; links: Link[] };

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function KGPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const fgRef = useRef<any>(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/kg/graph')
      .then(res => {
        const raw = res.data.data as Array<{
          source: string; source_name: string; source_label: string;
          target: string; target_name: string; target_label: string;
          relation: string;
        }>;

        const allLabels = Array.from(new Set([
          ...raw.map(i => i.source_label),
          ...raw.map(i => i.target_label)
        ]));
        const colorScale = scaleOrdinal<string, string>(schemeCategory10).domain(allLabels);

        const nodesMap = new Map<string, Node>();
        const links: Link[] = [];
        raw.forEach(item => {
          if (!nodesMap.has(item.source)) {
            nodesMap.set(item.source, {
              id: item.source,
              name: item.source_name,
              label: item.source_label,
              color: colorScale(item.source_label)
            });
          }
          if (!nodesMap.has(item.target)) {
            nodesMap.set(item.target, {
              id: item.target,
              name: item.target_name,
              label: item.target_label,
              color: colorScale(item.target_label)
            });
          }
          links.push({ source: item.source, target: item.target, label: item.relation });
        });

        const nodesArray = Array.from(nodesMap.values());

        // 重新布局节点：让它们紧凑排布在中心区域（避免乱飞）
        // 找出 City 节点（如“北京”）
        const cityNode = nodesArray.find(n => n.label === "City");
        if (cityNode) {
          cityNode.x = 0;
          cityNode.y = 0;
        }

        // 其他节点绕其环形排布
        const radius = 400;
        const others = nodesArray.filter(n => n !== cityNode);
        others.forEach((node, idx) => {
          const angle = (idx / others.length) * 2 * Math.PI;
          node.x = radius * Math.cos(angle);
          node.y = radius * Math.sin(angle);
        });


        setGraphData({
          nodes: nodesArray,
          links
        });

      })
      .catch(err => console.error('KG 获取失败', err));
  }, []);

  const nodeLabelCount = graphData.nodes.reduce((acc, n) => {
    acc[n.label] = (acc[n.label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const relTypeCount = graphData.links.reduce((acc, l) => {
    acc[l.label] = (acc[l.label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    if (graphData.nodes.length && fgRef.current) {
      const cityNode = graphData.nodes.find(n => n.label === "City");
      if (cityNode && cityNode.x !== undefined && cityNode.y !== undefined) {
        setTimeout(() => {
          fgRef.current.centerAt(cityNode.x, cityNode.y, 1000);  // 动画居中 City
          fgRef.current.zoom(0.5, 1000);  // 适当放大
        }, 300);
      } else {
        setTimeout(() => {
          fgRef.current.zoomToFit(400, 50); // 默认居中整个图
        }, 300);
      }
    }
  }, [graphData]);



  

  return (
    <div className="h-full bg-gray-100 p-4">
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* 左边2/3: 力导向图 */}
        <div className="col-span-2 bg-white rounded-lg shadow p-4 flex flex-col overflow-hidden">
          <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeLabel={(n: any) => n.name}
            linkLabel={(l: any) => l.label}
            nodeColor={(n: any) => n.color}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            width={window.innerWidth * 2 / 3}   // 左侧 2/3 栅格
            height={window.innerHeight - 120}   // 除去顶部导航栏
            cooldownTicks={100}
            onEngineStop={() => {
              //fgRef.current.zoomToFit(400, 50);
            }}
          />




          </div>
        </div>

        {/* 右边1/3: Overview */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full overflow-y-auto">
          <OverviewPanel
            nodeLabelCount={nodeLabelCount}
            relTypeCount={relTypeCount}
            nodes={graphData.nodes}
          />
        </div>

      </div>
    </div>
  );
}
