import React, { useState } from "react";
import Board from "./Board";
import "../../src/index.scss";

type GameProps = {};

export default function Game(props: GameProps) {
  const [height, setHeight] = useState<number>(14);
  const [width, setWidth] = useState<number>(14);
  const [mines, setMines] = useState<number>(10);

  return (
    <div className="game">
      <Board height={height} width={width} mines={mines} />
    </div>
  );
}
