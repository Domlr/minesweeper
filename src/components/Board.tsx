import React from "react";
import Cell, { CellValue } from "./Cell";

type BoardProps = {
  size: number;
  board: CellValue[][];
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const Board: React.FC<BoardProps> = ({
  size,
  board,
  onCellClick,
  onCellRightClick,
}) => {
  console.log(board);
  const renderCell = (row: number, col: number) => {
    if (!board[row]) {
      return null;
    }
    return (
      <Cell
        key={`${row}-${col}`}
        value={board[row][col]}
        onClick={() => onCellClick(row, col)}
        onContextMenu={onCellRightClick}
      />
    );
  };
  console.log(size, "this is the size");

  const renderRow = (rowIndex: number) => {
    return (
      <div key={rowIndex} className="row">
        {Array(size)
          .fill(null)
          .map((_, colIndex) => renderCell(rowIndex, colIndex))}
      </div>
    );
  };

  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${size}, 32px)`,
        gridTemplateRows: `repeat(${size}, 32px)`,
      }}
    >
      {Array(size)
        .fill(null)
        .map((_, rowIndex) => renderRow(rowIndex))}
    </div>
  );
};

export default Board;
