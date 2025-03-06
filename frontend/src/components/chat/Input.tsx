import React from "react";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
}

const Input: React.FC<InputProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="Enter your message..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default Input;
