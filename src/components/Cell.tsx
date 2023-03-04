import React, { useMemo } from "react";
import "./Board.scss";

export interface CellProps {
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
  const getValue = useMemo(() => {
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
  }, [value.isRevealed, value.isFlagged, value.isMine, value.neighbour]);

  let className =
    "cell" +
    (value.isRevealed ? "" : " hidden") +
    (value.isMine ? " is-mine" : "") +
    (value.isFlagged ? " is-flag" : "") +
    " cell-dimentions";

  return (
    <div onClick={onClick} className={className} onContextMenu={cMenu}>
      <div style={{ height: "20px" }}>{getValue}</div>
    </div>
  );
};

export default Cell;
