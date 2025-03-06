"use client";
import { useState } from "react";

export default function OntologyEditor() {
  const [name, setName] = useState("");
  const [type, setType] = useState("Class");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`创建: ${type} - ${name}`);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-gray-700">名称</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 p-2 block w-full border rounded-md"
          required
        />
      </label>

      <label className="block">
        <span className="text-gray-700">类型</span>
        <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 p-2 block w-full border rounded-md">
          <option>Class</option>
          <option>Property</option>
          <option>Relation</option>
        </select>
      </label>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded-lg">
        添加
      </button>
    </form>
  );
}
