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

  const setValueColor = useMemo(() => {
    if (value.neighbour === 1) {
      return "blue";
    }
    if (value.neighbour === 2) {
      return "green";
    }
    if (value.neighbour === 3) {
      return "red";
    }
    if (value.neighbour === 4) {
      return "purple";
    }
    if (value.neighbour === 5) {
      return "maroon";
    }
    if (value.neighbour === 6) {
      return "turquoise";
    }
    if (value.neighbour === 7) {
      return "black";
    }
    if (value.neighbour === 8) {
      return "gray";
    } else {
      return "";
    }
  }, [value.neighbour]);

  let className =
    "cell" +
    (value.isRevealed ? "" : " hidden") +
    (value.isMine ? " is-mine" : "") +
    (value.isFlagged ? " is-flag" : "") +
    " cell-dimentions";

  return (
    <div onClick={onClick} className={className} onContextMenu={cMenu}>
      <div
        style={{
          height: "20px",
          textShadow: `${
            !value.isFlagged &&
            !value.isMine &&
            value.isRevealed &&
            "2px 2px white"
          }`,
          color: `${setValueColor}`,
        }}
      >
        {getValue}
      </div>
    </div>
  );
};

export default Cell;
