import { useState } from "react";
import Board from "./Board";
import "./Board.scss";

type GameProps = {};

export default function Game(props: GameProps) {
  //keeping in as planning to add a menu to change these with difficulty settings
  const [height, setHeight] = useState<number>(8);
  const [width, setWidth] = useState<number>(8);
  const [mines, setMines] = useState<number>(10);

  return (
    <div className="game">
      <Board height={height} width={width} mines={mines} />
    </div>
  );
}
