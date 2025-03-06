import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface OntologyGraphProps {
  ontologyData: { nodes: any[]; edges: any[] };
}

export default function OntologyGraph({ ontologyData }: OntologyGraphProps) {
  const graphRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ontologyData.nodes.length) return;

    const width = 800;  // ✅ 让宽度更适应屏幕
    const height = 600; // ✅ 适当加大高度
    const svg = d3.select(graphRef.current);

    // ✅ 清空旧的 SVG，避免重复渲染
    svg.selectAll("*").remove();

    // ✅ 让 `g` 组跟随缩放
    const g = svg.append("g");

    // ✅ 添加 zoom 交互
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2]) // 限制缩放
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom as unknown as any);

    // ✅ 力导向图
    const simulation = d3.forceSimulation(ontologyData.nodes)
      .force("link", d3.forceLink(ontologyData.edges).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // ✅ 绘制连线
    const link = g.selectAll("line")
      .data(ontologyData.edges)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);

    // ✅ 绘制节点
    const node = g.selectAll("circle")
      .data(ontologyData.nodes)
      .enter().append("circle")
      .attr("r", 8)
      .attr("fill", (d: any) => d.type === "class" ? "blue" : "orange")
      .call(d3.drag<SVGCircleElement, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // ✅ 添加文本标签
    const text = g.selectAll("text")
      .data(ontologyData.nodes)
      .enter().append("text")
      .attr("dx", 10)
      .attr("dy", ".35em")
      .text((d: any) => d.label)
      .style("font-size", "12px");

    // ✅ 更新力导向图
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      text
        .attr("x", (d: any) => d.x + 10)
        .attr("y", (d: any) => d.y);
    });

  }, [ontologyData]);

  return (
    <div className="w-full flex justify-center items-center bg-gray-100 p-4 rounded-lg overflow-hidden">
      {/* ✅ 让 `svg` 自适应容器大小 */}
      <svg ref={graphRef} className="w-full h-full border rounded-lg" viewBox="0 0 800 600" />
    </div>
  );
}
