import React, { useState, useEffect } from "react";
import {
  getMines,
  getFlags,
  getHidden,
  initBoardData,
  traverseBoard,
} from "./HelperFunctions";
import { CellType, cellData } from "./CellTypes";
import Cell from "./Cell";

type BoardProps = {
  height: number;
  width: number;
  mines: number;
};

const Board: React.FC<BoardProps> = ({ height, width, mines }) => {
  const [boardData, setBoardData] = useState<CellType[][]>([]);
  const [gameStatus, setGameStatus] = useState<string>("Game in progress");
  const [mineCount, setMineCount] = useState<number>(mines);

  /* Helper Functions */

  useEffect(() => {
    const data = initBoardData(height, width, mines);
    setBoardData(data);
  }, [height, width, mines]);

  // reveals the whole board
  function revealBoard(
    boardData: CellType[][],
    setBoardData: React.Dispatch<React.SetStateAction<CellType[][]>>
  ) {
    const updatedData = [...boardData];
    updatedData.map((datarow) => {
      datarow.map((dataitem) => {
        dataitem.isRevealed = true;
      });
    });
    setBoardData(updatedData);
  }

  function revealEmpty(x: number, y: number, data: CellType[][]) {
    let area = traverseBoard(x, y, data, width, height);
    area.forEach((value) => {
      if (
        !value.isFlagged &&
        !value.isRevealed &&
        (value.isEmpty || !value.isMine)
      ) {
        data[value.x][value.y].isRevealed = true;
        if (value.isEmpty) {
          revealEmpty(value.x, value.y, data);
        }
      }
    });
    return data;
  }

  function handleCellClick(x: number, y: number) {
    // check if revealed. return if true.
    if (boardData[x][y].isRevealed || boardData[x][y].isFlagged) return null;

    // check if mine. game over if true
    if (boardData[x][y].isMine) {
      setGameStatus("You Lost.");
      revealBoard(boardData, setBoardData);
      alert("game over");
    }

    const updatedData = boardData.map((datarow) =>
      datarow.map((dataitem) => ({ ...dataitem }))
    );
    updatedData[x][y].isFlagged = false;
    updatedData[x][y].isRevealed = true;

    if (updatedData[x][y].isEmpty) {
      revealEmpty(x, y, updatedData);
    }

    if (getHidden(updatedData).length === mines) {
      setMineCount(0);
      setGameStatus("You Win.");
      revealBoard(boardData, setBoardData);
      alert("You Win");
    }

    setBoardData(updatedData);
    setMineCount(mines - getFlags(updatedData).length);
  }

  function handleContextMenu(e: React.MouseEvent, x: number, y: number) {
    e.preventDefault();
    let updatedData = boardData;
    let mines = mineCount;

    // check if already revealed
    if (updatedData[x][y].isRevealed) return;

    if (updatedData[x][y].isFlagged) {
      updatedData[x][y].isFlagged = false;
      mines++;
    } else {
      updatedData[x][y].isFlagged = true;
      mines--;
    }

    if (mines === 0) {
      const mineArray = getMines(updatedData);
      const FlagArray = getFlags(updatedData);
      if (JSON.stringify(mineArray) === JSON.stringify(FlagArray)) {
        setMineCount(0);
        setGameStatus("You Win.");
        revealBoard(boardData, setBoardData);
        alert("You Win");
      }
    }

    setBoardData(updatedData);
    setMineCount(mines);
  }

  const renderBoard = (data: CellType[][]): JSX.Element[] =>
    Array.from(data, (datarow, rowIndex) => (
      <div key={rowIndex}>
        {datarow.map((dataitem, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`}>
            <Cell
              onClick={() => handleCellClick(dataitem.x, dataitem.y)}
              cMenu={(e: React.MouseEvent) =>
                handleContextMenu(e, dataitem.x, dataitem.y)
              }
              value={dataitem}
            />
            {colIndex === datarow.length - 1 ? <div className="clear" /> : null}
          </div>
        ))}
      </div>
    ));

  return (
    <div className="board">
      <div className="game-info">
        <span className="info">Mines remaining: {mineCount}</span>
        <h1 className="info">{gameStatus}</h1>
      </div>
      {renderBoard(boardData)}
    </div>
  );
};

export default Board;
