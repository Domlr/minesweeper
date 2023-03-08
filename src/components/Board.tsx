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
import {
  faRotate,
  faTrash,
  faBomb,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  const [highestScore, setHighestScore] = useState<number>(1000);
  const [resetClicked, setResetClicked] = useState<boolean>(false);

  useEffect(() => {
    const currentHighScore = localStorage.getItem("highScore") || "1000";
    setHighestScore(parseInt(currentHighScore));
  }, []);

  // this will check if the mines are greater than the cells and set the status
  // to invalid params, however this wasn't to be an issue as I would use
  // select difficulties to lessen the user error
  useEffect(() => {
    if (mines >= height * width) {
      return setGameStatus(GameStatus.InvalidParams);
    }
  }, [height, width, mines, gameStatus]);

  //we set this to initialize the board data with the props passed in
  useEffect(() => {
    const data = initBoardData(height, width, mines);
    setBoardData(data);
  }, [height, width, mines]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    //this will start the timer is it is the first click and the game is running
    if (!firstClick && gameStatus === GameStatus.InProgress) {
      intervalId = setInterval(() => {
        setTimer((time) => time + 1);
      }, 1000);
    }

    highScore(timer);
    //this will stop it in any other condition, which is updated by the gamestatus
    return () => clearInterval(intervalId);
  }, [firstClick, gameStatus, highestScore]);

  useEffect(() => {
    //if it is the first click it will set the game to inprogress
    !firstClick && setGameStatus(GameStatus.InProgress);
  }, [firstClick]);

  //this will reveal all the cells on the board at the end of the game
  //it takes the board, updates each row and each sell to true and sets the board data
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

  const highScore = useCallback(
    (timer: number) => {
      if (
        resetClicked ||
        gameStatus !== GameStatus.Win ||
        timer === 0 ||
        highestScore < timer
      ) {
        setResetClicked(false);
        return highestScore;
      }

      setHighestScore(timer);
      localStorage.setItem("highScore", highestScore.toString());
      return highestScore;
    },
    [highestScore, gameStatus, resetClicked]
  );

  const resetScore = () => {
    setResetClicked(true);
    localStorage.setItem("highScore", "1000");
    setHighestScore(1000);
  };

  //this is used to reset the game to it's initial state, to start a new game
  const resetGame = useCallback(() => {
    const data = initBoardData(height, width, mines);
    setBoardData(data);
    setGameStatus(GameStatus.Start);
    setMineCount(mines);
    setFirstClick(true);
    setTimer(0);
  }, [height, width, mines]);

  //this uses recursive function to go through the cell of x and y and get the point boundaries.
  //then with the array it returns it loops through each and reveals any that are empty
  //then if the value is empty of that cell, it will call it again and do the same check
  //until all conditions are met for every empty cell adjacent
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
  //this will handle the operations of a cell when clicked
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      let updatedData = [...boardData];
      // Plant mines on first click, so you won't lose on first click
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
      const updatedDataXY = updatedData[x][y];
      // check if revealed or flagged. return if true.
      if (updatedDataXY.isRevealed || updatedDataXY.isFlagged) return null;

      // this will check and make you lost
      if (updatedDataXY.isMine) {
        setGameStatus(GameStatus.Lose);
        revealBoard(boardData, setBoardData);
      }

      updatedDataXY.isFlagged = false;
      updatedDataXY.isRevealed = true;

      //we check the cell to see if it's empty, then use the recursive function to check other cells
      if (updatedDataXY.isEmpty) {
        revealEmpty(x, y, updatedData);
      }

      //this will check to see if the hidden tiles are equal to how many mines, and set to win
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

  //handle the rightclick to flag a cell
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, x: number, y: number) => {
      e.preventDefault();

      // Check if first click has been made, won't let you click before game started
      if (firstClick) {
        return;
      }

      let updatedData = [...boardData];
      let mines = mineCount;

      const updatedDataXY = updatedData[x][y];

      // check if already revealed and won't let you click
      if (updatedDataXY.isRevealed) return;

      //sets the state of the cell flag to false/true and increments/decrements the mine count
      if (updatedDataXY.isFlagged) {
        updatedDataXY.isFlagged = false;
        mines++;
      } else {
        if (mines === 0) return;
        updatedDataXY.isFlagged = true;
        mines--;
      }
      //it checks to see if the mines are equal to the flags and if that's the case, game over
      if (mines === 0) {
        const mineArray = getMines(updatedData);
        const FlagArray = getFlags(updatedData);
        if (JSON.stringify(mineArray) === JSON.stringify(FlagArray)) {
          setMineCount(0);
          setGameStatus(GameStatus.Win);
          revealBoard(boardData, setBoardData);
        }
      }
      //updates the board data
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
            //sets the grid column to how many tiles there are so we could expand this game
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
    [handleCellClick, handleContextMenu, width]
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

          <div className="information">
            <div onClick={resetGame}>
              <h2>Restart: </h2>
              <h1 className={"restart-game-icon"}>
                <FontAwesomeIcon icon={faRotate} />
              </h1>
            </div>

            <div>
              <h2>Highscore:</h2>
              <div>
                <h1 style={{ display: "inline" }}>
                  {highestScore === 1000 ? "---" : highestScore + "s"}{" "}
                </h1>
                <h2 className={"reset-game-icon"} onClick={resetScore}>
                  {" "}
                  <FontAwesomeIcon icon={faTrash} />
                </h2>
              </div>
            </div>
          </div>
        </div>
        <div className="information">
          <span className="mines">
            <h2>
              <FontAwesomeIcon icon={faBomb} /> : {mineCount}
            </h2>
          </span>
          <span className="timer">
            <h2>
              <FontAwesomeIcon icon={faClock} />: {timer}s
            </h2>
          </span>
        </div>
      </div>
      {renderBoard(boardData)}
    </div>
  );
};

export default Board;
