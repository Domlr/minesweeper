import React, { useState, useEffect, useCallback } from "react";
import {
  getMines,
  getFlags,
  getHidden,
  initBoardData,
  pointBoundaries,
} from "./HelperFunctions";
import { CellType } from "./CellTypes";
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
  const [firstClick, setFirstClick] = useState(true);

  /* Helper Functions */

  useEffect(() => {
    if (mines >= height * width) {
      setGameStatus("Invalid game configuration: too many mines.");
      console.log(gameStatus);
      return;
    }
  }, [height, width, mines]);

  useEffect(() => {
    const data = initBoardData(height, width, mines);
    setBoardData(data);
  }, [firstClick]);

  const revealBoard = useCallback(
    (
      boardData: CellType[][],
      setBoardData: React.Dispatch<React.SetStateAction<CellType[][]>>
    ): void => {
      const updatedData = [...boardData];
      updatedData.map((datarow) => {
        datarow.map((dataitem) => {
          dataitem.isRevealed = true;
        });
      });
      setBoardData(updatedData);
    },
    []
  );

  const revealEmpty = useCallback(
    (x: number, y: number, data: CellType[][]) => {
      let area = pointBoundaries(x, y, data, width, height);
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
    },
    [width, height]
  );

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      let updatedData = [...boardData];
      console.log(
        mineCount,
        mines,
        firstClick,
        "this is the first click mines"
      );

      // Plant mines on first click
      if (mineCount === mines && firstClick) {
        const updatedDataWithMines = initBoardData(
          height,
          width,
          Math.min(mines, height * width - 1),
          x,
          y
        );
        updatedData = updatedDataWithMines;
        setFirstClick(false);
      }

      // check if revealed or flagged. return if true.
      if (updatedData[x][y].isRevealed || updatedData[x][y].isFlagged)
        return null;

      // check if mine. game over if true
      if (updatedData[x][y].isMine) {
        setGameStatus("You Lost.");
        revealBoard(boardData, setBoardData);
        alert("game over");
      }

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
    },
    [
      boardData,
      firstClick,
      height,
      mines,
      mineCount,
      revealEmpty,
      revealBoard,
      width,
    ]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, x: number, y: number) => {
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
    },
    [boardData, mineCount, revealBoard, setBoardData, setGameStatus]
  );

  const renderBoard = React.useMemo(
    () =>
      (data: CellType[][]): JSX.Element[] =>
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
                {colIndex === datarow.length - 1 ? (
                  <div className="clear" />
                ) : null}
              </div>
            ))}
          </div>
        )),
    [handleCellClick, handleContextMenu]
  );

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
