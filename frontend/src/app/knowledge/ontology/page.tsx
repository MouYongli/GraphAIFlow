"use client";
import { ExtendedOntologyNode } from "@/components/knowledge/ontology/OntologyTree";
import { useState } from "react";
import FileUploadManager from "@/components/file/FileUploadManager";
import OntologyGraph from "@/components/knowledge/ontology/OntologyGraph";
import OntologyEditor from "@/components/knowledge/ontology/OntologyEditor";
import { OntologyNode } from "@/components/knowledge/ontology/OntologyTree";
import type { ObjectProperty, DataProperty } from "@/components/knowledge/ontology/OntologyEditor";


//  统一使用 OntologyNode，不再用 ExtendedOntologyNode
interface OntologyLink {
  source: string;
  target: string;
  label: string;
  type: "ObjectProperty" | "subClassOf" | "DataProperty";
}



export default function OntologyPage() {
  const [ontologyData, setOntologyData] = useState({
    filename: "",
    nodes: [] as ExtendedOntologyNode[],
    links: [] as OntologyLink[],
    classes: [] as ExtendedOntologyNode[],
    object_properties: [] as ObjectProperty[],
    data_properties: [] as DataProperty[],  // ✅ 这里修复
  });
  

  const calculatePositions = (nodes: ExtendedOntologyNode[] = [], links: OntologyLink[] = []) => {
    if (!Array.isArray(nodes) || !Array.isArray(links)) {
      console.error("❌ calculatePositions: nodes 或 links 不是数组", nodes, links);
      return [];
    }
  
    const nodeMap = new Map<string, ExtendedOntologyNode>();
    nodes.forEach((node) => {
      nodeMap.set(node.id, node);
      node.depth = 0; // 默认都设为 0，避免未赋值
    });
  
    //  计算层次结构
    const setDepth = (nodeId: string, depth: number) => {
      if (!nodeMap.has(nodeId)) return;
      const node = nodeMap.get(nodeId)!;
      node.depth = Math.max(node.depth ?? 0, depth);
  
      // 让所有 `subClassOf` 关系的子类递增 depth
      links
        .filter((link) => link.type === "subClassOf" && link.target === nodeId)
        .forEach((link) => setDepth(link.source, depth + 1));
    };
  
    //  1️⃣ 找出所有**顶层类**（即：没有 `subClassOf` 的父类）
    const topLevelClasses = nodes.filter(
      (node) => !links.some((link) => link.source === node.id && link.type === "subClassOf")
    );
  
    //  2️⃣ 让所有顶层类成为“根节点”
    topLevelClasses.forEach((cls) => setDepth(cls.id, 0));
  
    //  3️⃣ 确保 Graph 里的 `depth` 影响位置（按层级排列）
    nodes.forEach((node, index) => {
      node.x = (node.depth || 0) * 400 + (Math.random() * 150 - 75); 
      node.y = (node.depth ?? 0) * 250 + (Math.random() * 150 - 75);
      });
    
    
  
    return nodes;
  };
  

  const handleParseFile = async (filename: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/files/${filename}/parse`);
      if (!response.ok) throw new Error("解析失败");
  
      const data = await response.json();
      console.log("📂 后端返回的数据:", data);
  
      if (!data || typeof data !== "object" || !data.graph) {
        throw new Error("解析失败：data.graph 未定义");
      }
  
      const graph = data.graph;
  
      //  **修正 `nodes` 类型**
      const nodes = (graph.nodes || []).map((node: any, index: number) => ({
        id: node.id || `node_${index}`,
        name: node.name || `Unnamed_${index}`,
        type: node.type || "Unknown",
        depth: 0,
        x: (index % 10) * 100 - 500,
        y: Math.floor(index / 10) * 80 - 400,
      }));
  
      //  **修正 `links` 类型**
      const nodeIds = new Set(nodes.map((n: any) => n.id));
      const missingNodes = new Set<string>();

      (graph.links || []).forEach((link: any) => {
        if (!nodeIds.has(link.source)) missingNodes.add(link.source);
        if (!nodeIds.has(link.target)) missingNodes.add(link.target);
      });
  
      //  **自动补充 Root 节点**
      const extraNodes = Array.from(missingNodes).map((id: string, index: number) => ({
        id,
        name: id,
        type: "Unknown",
        depth: 0,
        x: (index % 5) * 150 - 300,
        y: -400,
      }));

      const finalNodes = [...nodes, ...extraNodes];
  
      const validLinks = (graph.links || []).filter((link: any) =>
        finalNodes.some((node: any) => node.id === link.source) &&
        finalNodes.some((node: any) => node.id === link.target)
      );
  
      //  把 ObjectProperty 也转换成 links
      const objectPropertyLinks = (graph.object_properties || []).map((prop: any) => ({
        source: prop.source,
        target: prop.target,
        type: prop.name || "ObjectProperty"
      }));

      // ✅ 构建有效类 ID 集合
      const validClassIds = new Set(finalNodes.filter(n => n.type === "Class").map(n => n.id));

      // ✅ 过滤掉 domain 不存在的 DataProperty
      const validDataProps = (graph.data_properties || []).filter((prop: any) =>
        validClassIds.has(prop.source)
      );

      // 新增：把 DataProperty 也转换成 links（用于可视化）
      const dataPropertyLinks = validDataProps.map((prop: any) => ({
        source: prop.source,
        target: prop.target,
        type: "DataProperty",
        label: prop.name 
      }));

     

      // 合并三种关系：subClassOf + ObjectProperty + DataProperty
      //const links = [...(graph.links || []), ...objectPropertyLinks, ...dataPropertyLinks];

      let links = [...(graph.links || []), ...objectPropertyLinks, ...dataPropertyLinks];

      links = links.filter((link) => {
        if (link.type !== "DataProperty") return true;
        return validClassIds.has(link.source);
      });

      

      // ✅ 找出所有仍然被使用的 target（即所有有连线的数据类型）
      const usedDataTypes = new Set(
        links
          .filter(link => link.type === "DataProperty")
          .map(link => link.target)
      );

      // 创建这些数据类型的节点（如果还没在 finalNodes 中存在）
      const existingNodeIds = new Set(finalNodes.map((node) => node.id));
      const extraDataTypeNodes = Array.from(usedDataTypes)
        .filter((typeId) => !existingNodeIds.has(typeId))
        .map((typeId, index) => ({
          id: typeId,
          name: typeId,
          type: "Datatype",
          depth: 99,
          x: 600 + index * 50,
          y: -300,
        }));


      // 最终节点合并
      const allNodes = [...finalNodes, ...extraDataTypeNodes];
      

      // ✅ 移除未被引用的数据类型节点
      const cleanedNodes = allNodes.filter(node => {
        if (node.type === "Datatype") {
          return usedDataTypes.has(node.id);  // 只保留仍被引用的 Datatype
        }
        return true;  // 其他节点保留
      });


      console.log("🔍 原始 nodes (所有类):", finalNodes.filter(node => node.type === "Class"));
      console.log("🔍 解析的 links (子类关系):", links);



      function buildClassHierarchy(nodes: OntologyNode[], links: OntologyLink[]): OntologyNode[] {
        const nodeMap = new Map<string, OntologyNode>();
      
        // 1️⃣ **先创建所有 Class**
        nodes.forEach((node) => {
          nodeMap.set(node.id, { ...node, children: [] });
        });
      
        // 2️⃣ **建立层级关系**
        links.forEach((link) => {
          if (link.type === "subClassOf") {
            const parent = nodeMap.get(link.target);
            const child = nodeMap.get(link.source);
      
            if (parent && child) {
              parent.children?.push(child); // ⏩ 让 parent 关联 child
            }
          }
        });
      
        // 3️⃣ **找出顶级 Class**（即没有 parent 的 Class）
        const topLevelClasses = nodes.filter(
          (node) => !links.some((link) => link.source === node.id && link.type === "subClassOf")
        );
      
        // 4️⃣ **确保 `Thing` 存在，并让它连接所有顶级 Class**
        let hierarchy: OntologyNode[] = [];
        let thingNode = nodeMap.get("Thing");
      
        if (!thingNode) {
          // 🛠 如果 `Thing` 在 RDF 里不存在，我们创建一个虚拟的
          thingNode = { id: "Thing", name: "Thing", type: "Class", children: [] };
          nodeMap.set("Thing", thingNode);
        }
      
        // 5️⃣ **让 `Thing` 连接所有顶级类**
        thingNode.children = topLevelClasses.filter((cls) => cls.id !== "Thing");
        
        // 6️⃣ **确保所有子类的子类递归构建层级**
        function attachChildren(node: OntologyNode) {
          node.children?.forEach((child) => {
            child.children = links
              .filter((link) => link.type === "subClassOf" && link.target === child.id)
              .map((link) => nodeMap.get(link.source)!)
              .filter(Boolean); // 确保子类存在
            attachChildren(child); // ⏬ 递归处理子类
          });
        }
      
        attachChildren(thingNode); // 🏗 递归构建完整的层级结构
      
        return [thingNode]; //  以 `Thing` 作为顶级，完整返回
      }      
          

      const processedNodes = calculatePositions(cleanedNodes, links);

      setOntologyData({
        filename,
        nodes: processedNodes,
        links,
        classes: buildClassHierarchy(
          processedNodes.filter(node => node.type === "Class"),
          links
        ),
        object_properties: graph.object_properties || [],
        data_properties: validDataProps,  // ✅ 使用过滤后的
      });
      
      


      console.log("🔍 解析出的层级 Classes:", ontologyData.classes);

    } catch (error) {
      console.error("解析文件失败:", error);
    }
  };  
  
  
  
  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      <div className="col-span-2 flex flex-col gap-4">
        <FileUploadManager onParseFile={handleParseFile} onRefresh={() => console.log("刷新文件列表...")} />
          <div className="bg-gray-100 p-4 rounded-lg h-[600px] w-full overflow-hidden shadow">
            <h2 className="text-xl font-bold mb-4">Ontology 知识图谱</h2>
            <div className="relative w-full h-full">
              <OntologyGraph ontologyData={ontologyData} />
            </div>
          </div>
        </div>
      <div className="bg-white shadow-lg p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">编辑 Ontology</h2>
        <OntologyEditor
          ontologyData={
            ontologyData || {
              classes: [],
              object_properties: [],
              data_properties: [],
              nodes: [],
              filename: "", // 补上 filename，避免 undefined 报错
            }
          }
          onRefresh={() => {
            if (ontologyData.filename) {
              handleParseFile(ontologyData.filename); // 自动刷新
            }
          }}
          onReset={() => {
            if (ontologyData.filename) {
              handleParseFile(ontologyData.filename);  // ✅ 就是你原本想做的
            }
          }}
        />
      </div>
    </div>
  );
}
