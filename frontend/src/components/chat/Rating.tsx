'use client';

import { useState, useEffect } from 'react';

interface RatingProps {
  onRate: (score: number) => void;
  disabled?: boolean;          // 新增：是否禁用
  defaultScore?: number;        // 新增：初始分数
}

export default function Rating({ onRate, disabled = false, defaultScore }: RatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(defaultScore ?? null);

  useEffect(() => {
    if (defaultScore !== undefined) {
      setSelected(defaultScore);
    }
  }, [defaultScore]);

  const handleClick = (score: number) => {
    if (disabled) return; // 禁止打分
    setSelected(score);
    onRate(score);
  };

  return (
    <div className="flex items-center space-x-1 mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => !disabled && setHovered(null)}
          onClick={() => handleClick(star)}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 cursor-pointer ${
            (hovered ?? selected ?? 0) >= star ? 'text-yellow-400' : 'text-gray-300'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.184c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.539 1.118l-3.39-2.462a1 1 0 00-1.176 0l-3.39 2.462c-.783.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.393c-.783-.57-.38-1.81.588-1.81h4.184a1 1 0 00.95-.69l1.286-3.966z" />
        </svg>
      ))}
      {selected && (
        <span className="text-sm text-gray-500 ml-2">已评分 {selected} 分</span>
      )}
    </div>
  );
}
