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
import "./Board.scss";

type BoardProps = {
  height: number;
  width: number;
  mines: number;
};

enum GameStatus {
  Start = "Click a tile to start the game!",
  Lose = "You lost, try again?",
  Win = "Congrats you win! Try again?",
  InProgress = "Game in progress...",
  InvalidParams = "Invalid game configuration: too many mines.",
}

const Board: React.FC<BoardProps> = ({ height, width, mines }) => {
  const [boardData, setBoardData] = useState<CellType[][]>([]);
  const [gameStatus, setGameStatus] = useState<string>(GameStatus.Start);
  const [mineCount, setMineCount] = useState<number>(mines);
  const [firstClick, setFirstClick] = useState(true);
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    if (mines >= height * width) {
      return setGameStatus(GameStatus.InvalidParams);
    }
  }, [height, width, mines, gameStatus]);

  useEffect(() => {
    const data = initBoardData(height, width, mines);
    setBoardData(data);
  }, [height, width, mines]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (!firstClick && gameStatus === GameStatus.InProgress) {
      intervalId = setInterval(() => {
        setTimer((time) => time + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [firstClick, gameStatus]);

  useEffect(() => {
    !firstClick && setGameStatus(GameStatus.InProgress);
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

  const resetGame = useCallback(() => {
    const data = initBoardData(height, width, mines);
    setBoardData(data);
    setGameStatus(GameStatus.Start);
    setMineCount(mines);
    setFirstClick(true);
    setTimer(0);
  }, [height, width, mines]);

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
      // Plant mines on first click
      if (firstClick) {
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
        setGameStatus(GameStatus.Lose);
        revealBoard(boardData, setBoardData);
      }

      updatedData[x][y].isFlagged = false;
      updatedData[x][y].isRevealed = true;

      if (updatedData[x][y].isEmpty) {
        revealEmpty(x, y, updatedData);
      }

      if (getHidden(updatedData).length === mines) {
        setMineCount(0);
        setGameStatus(GameStatus.Win);
        revealBoard(boardData, setBoardData);
      }

      setBoardData(updatedData);
      setMineCount(mines - getFlags(updatedData).length);
    },
    [boardData, firstClick, height, mines, revealEmpty, revealBoard, width]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, x: number, y: number) => {
      e.preventDefault();

      // Check if first click has been made
      if (firstClick) {
        return;
      }

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
          setGameStatus(GameStatus.Win);
          revealBoard(boardData, setBoardData);
        }
      }

      setBoardData(updatedData);
      setMineCount(mines);
    },
    [boardData, firstClick, mineCount, revealBoard, setBoardData, setGameStatus]
  );

  const renderBoard = React.useMemo(
    () =>
      (data: CellType[][]): JSX.Element[] =>
        data.map((datarow, rowIndex) => (
          <div
            style={{ gridColumn: `1/${width + 1}` }}
            className={"tile"}
            key={rowIndex}
          >
            {datarow.map((dataitem, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={"tile-cell-container"}
              >
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
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${width})`,
        gridTemplateRows: `repeat(${height})`,
      }}
    >
      <div className="game-info" style={{ gridColumn: `1/${width + 1}` }}>
        <div>
          <h1 className="game-status">{gameStatus}</h1>
          <h1 onClick={resetGame}>Restart: 🔄</h1>
        </div>
        <div className="information">
          <span className="mines">
            <h2>Mines remaining: {mineCount}</h2>
          </span>
          <span className="timer">
            <h2>Time: {timer}s</h2>
          </span>
        </div>
      </div>
      {renderBoard(boardData)}
    </div>
  );
};

export default Board;
