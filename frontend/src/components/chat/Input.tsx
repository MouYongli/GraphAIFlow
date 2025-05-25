import React, { KeyboardEvent } from "react";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onSend?: () => void;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({ value, onChange, onSend, placeholder }) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSend?.(); // ⏎ 直接发送
    }
  };

  return (
    <input
      type="text"
      className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder={placeholder || "请输入你的问题..."}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown} // 绑定键盘事件
    />
  );
};

export default Input;
