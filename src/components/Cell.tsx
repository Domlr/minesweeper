import React from "react";

export type CellValue = "hidden" | "revealed" | "flagged" | "mine" | number;

type CellProps = {
  value: CellValue;
  onClick: () => void;
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const Cell: React.FC<CellProps> = ({ value, onClick }) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    onClick();
  };

  return (
    <div className={`cell ${value}`} onClick={handleClick}>
      {value !== "hidden" && value !== "flagged" ? value : ""}
    </div>
  );
};

export default Cell;
