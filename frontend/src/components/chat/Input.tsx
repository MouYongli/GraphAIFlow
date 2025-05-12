import React, { KeyboardEvent } from "react";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onSend?: () => void;  // ✅ 新增回车发送回调
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({ value, onChange, onSend }) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend?.(); // 调用发送方法
    }
  };

  return (
    <input
      type="text"
      className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="Enter your message..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown} // ✅ 回车事件绑定
    />
  );
};

export default Input;
