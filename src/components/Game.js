import React, { useState } from 'react';
import Board from './Board';
import '../../src/index.scss';

export default function Game() {
  const [height, setHeight] = useState(8);
  const [width, setWidth] = useState(8);
  const [mines, setMines] = useState(10);

  return (
    <div className="game">
      <Board
        height={height}
        width={width}
        mines={mines}
        setHeight={setHeight}
        setWidth={setWidth}
        setMines={setMines}
      />
    </div>
  );
}

