"use client";
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// 只导入 2D 版本，禁用 SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

export default function OntologyGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 更新容器尺寸
  useEffect(() => {
    function updateDimensions() {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    }
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graphData = {
    nodes: [
      { id: 'http://example.org#author1', name: 'author1' },
      { id: 'http://example.org#author2', name: 'author2' },
      { id: 'http://example.org#author3', name: 'author3' },
      { id: 'http://example.org#book1', name: 'book1' },
      { id: 'http://example.org#book2', name: 'book2' },
      { id: 'http://example.org#book3', name: 'book3' },
      { id: 'http://example.org#library', name: 'library' },
      { id: 'http://example.org#publisher1', name: 'publisher1' },
      { id: 'http://example.org#publisher2', name: 'publisher2' },
      { id: 'http://example.org#city', name: 'city' },
    ],
    links: [
      {
        source: 'http://example.org#author1',
        target: 'http://example.org#book1',
        label: 'http://example.org#hasWritten',
      },
      {
        source: 'http://example.org#author1',
        target: 'http://example.org#book3',
        label: 'http://example.org#hasWritten',
      },
      {
        source: 'http://example.org#author2',
        target: 'http://example.org#book2',
        label: 'http://example.org#hasWritten',
      },
      {
        source: 'http://example.org#book1',
        target: 'http://example.org#publisher1',
        label: 'http://example.org#publishedBy',
      },
      {
        source: 'http://example.org#book2',
        target: 'http://example.org#publisher2',
        label: 'http://example.org#publishedBy',
      },
      {
        source: 'http://example.org#book3',
        target: 'http://example.org#publisher1',
        label: 'http://example.org#publishedBy',
      },
      {
        source: 'http://example.org#library',
        target: 'http://example.org#city',
        label: 'http://example.org#ownedBy',
      },
      {
        source: 'http://example.org#publisher1',
        target: 'http://example.org#city',
        label: 'http://example.org#locatedIn',
      },
      {
        source: 'http://example.org#publisher2',
        target: 'http://example.org#city',
        label: 'http://example.org#locatedIn',
      },
    ],
  };

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 确保只有在获取到尺寸后再渲染图谱 */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          linkLabel="label"
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          linkWidth={1}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}
    </div>
  );
}
