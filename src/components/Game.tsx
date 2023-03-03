import React, { useState, useEffect } from "react";
import Board from "./Board";
import Cell, { CellValue } from "./Cell";

type GameState = {
  size: number;
  mines: number;
  remainingMines: number;
  revealedCells: number;
  isGameOver: boolean;
  isGameWon: boolean;
};

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    size: 10,
    mines: 10,
    remainingMines: 10,
    revealedCells: 0,
    isGameOver: false,
    isGameWon: false,
  });

  const [board, setBoard] = useState<CellValue[][]>([[]]);

  useEffect(() => {
    handleReset();
  }, []);

  const generateBoard = (size: number, mines: number): CellValue[][] => {
    // Create an empty board
    const board: CellValue[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill("hidden"));

    // Place mines randomly on the board
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (board[row][col] !== "mine") {
        board[row][col] = "mine";
        minesPlaced++;
      }
    }

    // Calculate the number of adjacent mines for each cell
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (typeof board[row][col] !== "number") {
          let adjacentMines = 0;
          for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
              if (
                i >= 0 &&
                i < size &&
                j >= 0 &&
                j < size &&
                board[i][j] === "mine"
              ) {
                adjacentMines++;
              }
            }
          }
          board[row][col] = adjacentMines;
        }
      }
    }

    return board;
  };

  const handleCellClick = (row: number, col: number) => {
    // Ignore clicks if the game is over
    if (gameState.isGameOver || gameState.isGameWon) {
      return;
    }

    // TODO: Implement cell click logic
  };

  const handleCellRightClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    // Ignore right clicks if the game is over
    if (gameState.isGameOver || gameState.isGameWon) {
      return;
    }

    // TODO: Implement cell right-click logic
  };

  const handleReset = () => {
    const newBoard = generateBoard(gameState.size, gameState.mines);
    setBoard(newBoard);
    setGameState({
      size: gameState.size,
      mines: gameState.mines,
      remainingMines: gameState.mines,
      revealedCells: 0,
      isGameOver: false,
      isGameWon: false,
    });
  };

  return (
    <div className="game">
      <div className="header">
        <div className="title">Minesweeper</div>
        <div className="stats">
          <div className="stat">Mines: {gameState.remainingMines}</div>
          <div className="stat">Time: 00:00</div>
        </div>
        <button className="reset-button" onClick={handleReset}>
          Reset
        </button>
      </div>
      <Board
        size={gameState.size}
        board={board}
        onCellClick={handleCellClick}
        onCellRightClick={handleCellRightClick}
      />
      {gameState.isGameOver && <div className="game-over">Game over!</div>}
      {gameState.isGameWon && <div className="game-won">You won!</div>}
    </div>
  );
};

export default Game;
