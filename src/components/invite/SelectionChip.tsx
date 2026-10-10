import React from "react";

interface SelectionChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export const SelectionChip: React.FC<SelectionChipProps> = ({
  label,
  selected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[12px] transition ${
        selected
          ? "border-black bg-white font-medium"
          : "border-[#ddd] text-[#777]"
      }`}
    >
      {selected && "✓ "}
      {label}
    </button>
  );
};
