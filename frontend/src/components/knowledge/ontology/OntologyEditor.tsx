import { useState } from "react"; 
import OntologyTree, { OntologyNode } from "./OntologyTree";
import { useTranslation } from "react-i18next";

export interface ObjectProperty {
  name: string;
  source: string;
  target: string;
}


export interface DataProperty {
  name: string;
  source: string;
  target: string;
  rangeType?: string;  // 可选的，视需求
}


interface OntologyEditorProps {
  ontologyData?: {
    classes: OntologyNode[];
    object_properties: ObjectProperty[];
    data_properties: DataProperty[];
    nodes?: { id: string; name: string; type: string }[];
    filename?: string;
  };
  onRefresh?: () => void;
  onReset?: () => void; // ✅ 新增
}


export default function OntologyEditor({ ontologyData, onRefresh, onReset }: OntologyEditorProps) {
  if (!ontologyData) {
    console.error("❌ `ontologyData` 为空，检查数据传递！");
    return <p className="text-red-500">⚠️ 加载本体数据失败</p>;
  }
  const { t } = useTranslation("common");

  const [deleteMode, setDeleteMode] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [newClassName, setNewClassName] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  const [newObjectProp, setNewObjectProp] = useState("");
  const [objectDomain, setObjectDomain] = useState("");
  const [objectRange, setObjectRange] = useState("");
  const [newDataProp, setNewDataProp] = useState("");
  const [dataDomain, setDataDomain] = useState("");
  const [dataType, setDataType] = useState("string");
  const [showObjectProps, setShowObjectProps] = useState(false);
  const [showDataProps, setShowDataProps] = useState(false);
  const API_BASE_URL = "http://localhost:8000";

  const extractAllClassNames = () => {
    const allNodes = ontologyData.nodes || [];
    return allNodes
      .filter((node) => node.type === "Class")
      .map((node) => node.name || node.id);
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newExpanded = new Set(prev);
      newExpanded.has(nodeId) ? newExpanded.delete(nodeId) : newExpanded.add(nodeId);
      return newExpanded;
    });
  };

  const handleDeleteClass = async (className: string) => {
    if (!ontologyData.filename) return;
    const confirmed = confirm(`确定删除类 "${className}" 吗？`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/ontology/delete_class`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: ontologyData.filename,
          class_name: className,
        }),
      });

      const result = await res.json();
      if (result.message) {
        alert("✅ 删除成功");
        onRefresh?.();
      } else {
        alert("❌ 删除失败: " + result.error);
      }
    } catch (err) {
      alert("❌ 网络错误: " + err);
    }
  };

  const handleDeleteObjectProperty = async (propName: string) => {
    if (!ontologyData.filename) return;
    const confirmed = confirm(`确定删除 ObjectProperty \"${propName}\" 吗？`);
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ontology/delete_object_property`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: ontologyData.filename, prop_name: propName }),
      });
      const result = await res.json();
      if (result.message) {
        alert("✅ 删除成功");
        onRefresh?.();
      } else {
        alert("❌ 删除失败: " + result.error);
      }
    } catch (err) {
      alert("❌ 网络错误: " + err);
    }
  };

  const handleDeleteDataProperty = async (propName: string) => {
    if (!ontologyData.filename) return;
    const confirmed = confirm(`确定删除 DataProperty \"${propName}\" 吗？`);
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ontology/delete_data_property`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: ontologyData.filename, prop_name: propName }),
      });
      const result = await res.json();
      if (result.message) {
        alert("✅ 删除成功");
        onRefresh?.();
      } else {
        alert("❌ 删除失败: " + result.error);
      }
    } catch (err) {
      alert("❌ 网络错误: " + err);
    }
  };

  const handleAddClass = async () => {
    if (!newClassName || !selectedParent || !ontologyData.filename) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ontology/add_class`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: ontologyData.filename,
          class_name: newClassName,
          parent_class: selectedParent,
        }),
      });
      if (res.ok) {
        setNewClassName("");
        setSelectedParent("");
        onRefresh?.();
      } else {
        const result = await res.json();
        alert("❌ 添加失败: " + (result.error || "未知错误"));
      }
    } catch (err) {
      console.error("❌ 网络请求失败：", err);
    }
  };

  const handleAddObjectProperty = async () => {
    if (!newObjectProp || !objectDomain || !objectRange || !ontologyData.filename) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ontology/add_object_property`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: ontologyData.filename,
          prop_name: newObjectProp,
          domain: objectDomain,
          range_: objectRange,
        }),
      });
      const result = await res.json();
      if (result.message) {
        setNewObjectProp("");
        setObjectDomain("");
        setObjectRange("");
        onRefresh?.();
      } else {
        alert("❌ 添加失败: " + result.error);
      }
    } catch (err) {
      alert("❌ 请求出错: " + err);
    }
  };

  const handleAddDataProperty = async () => {
    if (!newDataProp || !dataDomain || !dataType || !ontologyData.filename) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ontology/add_data_property`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: ontologyData.filename,
          prop_name: newDataProp,
          domain: dataDomain,
          range_: dataType,
        }),
      });
      const result = await res.json();
      if (result.message) {
        setNewDataProp("");
        setDataDomain("");
        setDataType("string");
        onRefresh?.();
      } else {
        alert("❌ 添加失败: " + result.error);
      }
    } catch (err) {
      alert("❌ 请求出错: " + err);
    }
  };

  const renderClassHierarchy = (nodes: OntologyNode[], depth = 0) => (
    <ul className="ml-2">
      {nodes.map((cls, index) => (
        <li key={index} className="mt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleNode(cls.id)}
              className="focus:outline-none flex items-center hover:bg-gray-100 px-1 rounded"
            >
              <span className="mr-1 text-black">
                {cls.children && cls.children.length > 0
                  ? expandedNodes.has(cls.id)
                    ? "▾"
                    : "▸"
                  : "•"}
              </span>
              <span className={depth === 0 ? "font-bold" : ""}>{cls.name}</span> (Class)
            </button>
            {deleteMode && (
              <button onClick={() => handleDeleteClass(cls.id)}>删除</button>

            )}
          </div>
          {expandedNodes.has(cls.id) && Array.isArray(cls.children) && cls.children.length > 0 && (
            <div className="ml-4">{renderClassHierarchy(cls.children, depth + 1)}</div>
          )}
        </li>
      ))}
    </ul>
  );

  // ✅ 重置图谱：重新拉取原始数据
  const handleReset = () => {
    onReset?.();  // ✅ 触发外部传入的 reset 方法
  };


// ✅ 导出图谱：发送到后端导出
const handleExport = async () => {
  if (!ontologyData.filename) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/ontology/export?filename=${ontologyData.filename}`);
    if (!res.ok) throw new Error("导出失败");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ontologyData.filename;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("❌ 导出失败：" + err);
  }
};


  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t("ontology.structure")}</h2>
        <div className="mb-2">
          <button
            className={`px-3 py-1 rounded text-sm ${deleteMode ? "bg-red-600 text-white" : "bg-gray-200"}`}
            onClick={() => setDeleteMode(!deleteMode)}
          >
            {deleteMode ? t("ontology.exitDeleteMode") : t("ontology.deleteMode")}
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mt-4">{t("ontology.classTitle")}</h3>
          {ontologyData.classes.length > 0 ? (
            renderClassHierarchy(ontologyData.classes)
          ) : (
            <p className="text-gray-500">{t("ontology.noClasses")}</p>
          )}
          <div className="mt-2 flex gap-2 items-center">
            <select
              className="border px-2 py-1 rounded text-sm"
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
            >
              <option value="">{t("ontology.selectParent")}</option>
              {extractAllClassNames().map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
            <input
              className="border px-2 py-1 text-sm rounded"
              placeholder={t("ontology.className")}
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={handleAddClass}
            >
              {t("ontology.add")}
            </button>
          </div>
        </div>

        <div>
          <h3
            className="text-lg font-semibold mt-4 cursor-pointer flex items-center"
            onClick={() => setShowObjectProps(!showObjectProps)}
          >
            <span className="mr-1">{showObjectProps ? "▾" : "▸"}</span>
            {t("ontology.objectProperties")}
          </h3>
          {showObjectProps && ontologyData.object_properties.length > 0 ? (
            <ul>
              {ontologyData.object_properties.map((prop, index) => (
                <li key={index} className="flex gap-2 items-center">
                  {prop.name} (ObjectProperty)
                  <span className="text-gray-500 text-sm ml-2">
                    [{prop.source} → {prop.target}]
                  </span>
                  {deleteMode && (
                    <button
                      onClick={() => handleDeleteObjectProperty(prop.name)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      {t("ontology.delete")}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">{t("ontology.noObjectProps")}</p>
          )}

          <div className="mt-2 flex flex-col gap-2">
            <input
              className="border px-2 py-1 text-sm rounded"
              placeholder={t("ontology.propertyName")}
              value={newObjectProp}
              onChange={(e) => setNewObjectProp(e.target.value)}
            />
            <div className="flex gap-2">
              <select
                className="border px-2 py-1 rounded text-sm"
                value={objectDomain}
                onChange={(e) => setObjectDomain(e.target.value)}
              >
                <option value="">{t("ontology.selectDomain")}</option>
                {extractAllClassNames().map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </select>
              <select
                className="border px-2 py-1 rounded text-sm"
                value={objectRange}
                onChange={(e) => setObjectRange(e.target.value)}
              >
                <option value="">{t("ontology.selectRange")}</option>
                {extractAllClassNames().map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </select>
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                onClick={handleAddObjectProperty}
              >
                {t("ontology.add")}
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3
            className="text-lg font-semibold mt-4 cursor-pointer flex items-center"
            onClick={() => setShowDataProps(!showDataProps)}
          >
            <span className="mr-1">{showDataProps ? "▾" : "▸"}</span>
            {t("ontology.dataProperties")}
          </h3>
          {showDataProps && ontologyData.data_properties.length > 0 ? (
            <ul>
              {ontologyData.data_properties.map((prop, index) => (
                <li key={index} className="flex gap-2 items-center">
                  {prop.name} (DataProperty)
                  {prop.source && prop.target && (
                    <span className="text-gray-500 text-sm ml-2">
                      [{prop.source} → {prop.target} : {prop.rangeType}]
                    </span>
                  )}
                  {deleteMode && (
                    <button
                      onClick={() => handleDeleteDataProperty(prop.name)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      {t("ontology.delete")}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">{t("ontology.noDataProps")}</p>
          )}

          <div className="mt-2 flex flex-col gap-2">
            <input
              className="border px-2 py-1 text-sm rounded"
              placeholder={t("ontology.propertyName")}
              value={newDataProp}
              onChange={(e) => setNewDataProp(e.target.value)}
            />
            <div className="flex gap-2">
              <select
                className="border px-2 py-1 rounded text-sm"
                value={dataDomain}
                onChange={(e) => setDataDomain(e.target.value)}
              >
                <option value="">{t("ontology.selectClass")}</option>
                {extractAllClassNames().map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </select>
              <select
                className="border px-2 py-1 rounded text-sm"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
              >
                <option value="string">string</option>
                <option value="int">int</option>
                <option value="float">float</option>
                <option value="boolean">boolean</option>
              </select>
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                onClick={handleAddDataProperty}
              >
                {t("ontology.add")}
              </button>
            </div>

            <div className="mt-6 flex gap-4 flex-wrap">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                onClick={handleReset}
              >
                {t("ontology.resetGraph")}
              </button>

              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                onClick={handleExport}
              >
                {t("ontology.exportGraph")}
              </button>
            </div>
          </div>
        </div>


    </div>
  );
}