'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// 只导入 2D 版本，禁用 SSR，避免在服务器环境调用
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false
})

export default function OntologyGraph() {
  // 假设我们离线解析 RDF 获得以下 JSON，
  // 这里直接手写(硬编码) { nodes, edges } -> 变为 react-force-graph 需要的 { nodes, links }
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
      { id: 'http://example.org#city', name: 'city' }
    ],
    links: [
      {
        source: 'http://example.org#author1',
        target: 'http://example.org#book1',
        label: 'http://example.org#hasWritten'
      },
      {
        source: 'http://example.org#author1',
        target: 'http://example.org#book3',
        label: 'http://example.org#hasWritten'
      },
      {
        source: 'http://example.org#author2',
        target: 'http://example.org#book2',
        label: 'http://example.org#hasWritten'
      },
      {
        source: 'http://example.org#book1',
        target: 'http://example.org#publisher1',
        label: 'http://example.org#publishedBy'
      },
      {
        source: 'http://example.org#book2',
        target: 'http://example.org#publisher2',
        label: 'http://example.org#publishedBy'
      },
      {
        source: 'http://example.org#book3',
        target: 'http://example.org#publisher1',
        label: 'http://example.org#publishedBy'
      },
      {
        source: 'http://example.org#library',
        target: 'http://example.org#city',
        label: 'http://example.org#ownedBy'
      },
      {
        source: 'http://example.org#publisher1',
        target: 'http://example.org#city',
        label: 'http://example.org#locatedIn'
      },
      {
        source: 'http://example.org#publisher2',
        target: 'http://example.org#city',
        label: 'http://example.org#locatedIn'
      }
    ]
  }

  // 在 react-force-graph 中:
  // - "nodeLabel" 用来指定鼠标悬停或显示的文本字段
  // - "linkLabel" 指定连线的文本字段
  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="name"
      linkLabel="label"
      linkDirectionalArrowLength={6}
      linkDirectionalArrowRelPos={1}
      linkWidth={1}
      width={800}
      height={600}
    />
  )
}
