import React from "react";

interface CellProps {
  value: {
    isRevealed: boolean;
    isMine: boolean;
    isFlagged: boolean;
    neighbour: number;
  };
  onClick: () => void;
  cMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Cell: React.FC<CellProps> = ({ value, onClick, cMenu }) => {
  const getValue = (): string | number | null => {
    if (!value.isRevealed) {
      return value.isFlagged ? "🚩" : null;
    }
    if (value.isMine) {
      return "💣";
    }
    if (value.neighbour === 0) {
      return null;
    }
    return value.neighbour;
  };

  let className =
    "cell" +
    (value.isRevealed ? "" : " hidden") +
    (value.isMine ? " is-mine" : "") +
    (value.isFlagged ? " is-flag" : "");

  return (
    <div onClick={onClick} className={className} onContextMenu={cMenu}>
      {getValue()}
    </div>
  );
};

export default Cell;
