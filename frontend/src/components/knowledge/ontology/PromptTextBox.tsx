import React from "react";

interface Props {
  content: string;
}

const PromptTextBox: React.FC<Props> = ({ content }) => (
  <textarea
    className="w-full h-[500px] border border-gray-300 rounded p-2 text-sm font-mono"
    value={content}
    readOnly
  />
);

export default PromptTextBox;
