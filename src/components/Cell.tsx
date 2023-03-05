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

const colors = [
  "",
  "blue",
  "green",
  "red",
  "purple",
  "maroon",
  "turquoise",
  "black",
  "gray",
];

//This represents a single cell on the board
const Cell: React.FC<CellProps> = ({ value, onClick, cMenu }) => {
  // based on the value, it will render the correct text

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

  //sets the css dynamically based on the results of the value of that cell.
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
          //based on the value of neighbour, go through the array of colors and set the color on the index.
          color: `${colors[value.neighbour]}`,
        }}
      >
        {getValue}
      </div>
    </div>
  );
};

export default Cell;
