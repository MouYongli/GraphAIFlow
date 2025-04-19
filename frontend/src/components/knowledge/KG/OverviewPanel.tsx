'use client';

import React from 'react';

interface Node {
  id: string;
  name: string;
  label: string;
  color: string;
}

interface OverviewPanelProps {
  nodeLabelCount: Record<string, number>;
  relTypeCount: Record<string, number>;
  nodes: Node[];
}

export default function OverviewPanel({
  nodeLabelCount,
  relTypeCount,
  nodes
}: OverviewPanelProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '24px 20px',
        borderLeft: '1px solid #eee',
        overflowY: 'auto',
        backgroundColor: '#fafafa',
        boxSizing: 'border-box'
      }}
    >
      <h3 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 24 }}>
        Overview
      </h3>

      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, borderBottom: '1px solid #ddd', paddingBottom: 4 }}>
          Node Labels
        </h4>
        {Object.entries(nodeLabelCount).map(([label, count]) => {
          const color = nodes.find(n => n.label === label)?.color || '#999';
          return (
            <div
              key={label}
              style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: color,
                  marginRight: 10,
                  border: '1px solid #666'
                }}
              />
              <span style={{ fontSize: 16 }}>{label} ({count})</span>
            </div>
          );
        })}
      </div>

      <div>
        <h4 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, borderBottom: '1px solid #ddd', paddingBottom: 4 }}>
          Relationship Types
        </h4>
        {Object.entries(relTypeCount).map(([label, count]) => (
          <div
            key={label}
            style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: '1px solid #666',
                marginRight: 10
              }}
            />
            <span style={{ fontSize: 16 }}>{label} ({count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
